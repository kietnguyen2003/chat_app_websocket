package http

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/application/chat"
	ws "backend-chat-app/internal/infrastructure/websocket"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketHandle struct {
	hub         *ws.Hub
	chatService *chat.ChatService
}

func NewWebSocketHandle(hub *ws.Hub, chatService *chat.ChatService) *WebSocketHandle {
	return &WebSocketHandle{
		hub:         hub,
		chatService: chatService,
	}
}

func (h *WebSocketHandle) HandleWebSocket(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		log.Printf("WebSocket auth failed: user_id not found in context")
		c.JSON(http.StatusUnauthorized, FailResponse(nil, "Unauthorized"))
		return
	}

	userIDStr := userID.(string)
	log.Printf("WebSocket connection attempt from user: %s", userIDStr)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		c.JSON(http.StatusInternalServerError, FailResponse(nil, "WebSocket upgrade failed"))
		return
	}

	log.Printf("WebSocket connection established for user: %s", userIDStr)

	client := &ws.Client{
		ID:   userIDStr,
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  h.hub,
	}

	h.hub.Register <- client

	go h.writePump(client)
	go h.readPump(client)
}

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

func (h *WebSocketHandle) readPump(client *ws.Client) {
	defer func() {
		h.hub.Unregister <- client
		client.Conn.Close()
	}()

	client.Conn.SetReadDeadline(time.Now().Add(pongWait))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		log.Printf("Received raw WebSocket message: %s", string(message))

		var msg ws.Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Invalid message format: %v", err)
			continue
		}

		log.Printf("Parsed WebSocket message - Type: %s, ConversationID: %s, SenderID: %s",
			msg.Type, msg.ConversationID, msg.SenderID)

		switch msg.Type {
		case "join_conversation":
			log.Printf("User %s joining conversation %s", client.ID, msg.ConversationID)
			h.hub.JoinConversation(msg.ConversationID, client.ID)

			// Send confirmation back to client
			confirmMsg := ws.Message{
				Type:           "join_success",
				ConversationID: msg.ConversationID,
				SenderID:       client.ID,
				CreatedAt:      time.Now().Unix(),
			}
			confirmJSON, _ := json.Marshal(confirmMsg)
			select {
			case client.Send <- confirmJSON:
				log.Printf("Join confirmation sent to user %s for conversation %s", client.ID, msg.ConversationID)
			default:
				log.Printf("Failed to send join confirmation to user %s", client.ID)
			}
		case "new_conversation":
			log.Printf("Broadcasting new conversation %s notification", msg.ConversationID)
			h.hub.Broadcast <- &msg
		case "new_message":
			log.Printf("Processing new message from %s in conversation %s: %s",
				msg.SenderID, msg.ConversationID, msg.Messeage)
			req := &application.SendMesseageRequest{
				ConversationID: msg.ConversationID,
				SenderID:       msg.SenderID,
				Messeage:       msg.Messeage,
			}
			res, err := h.chatService.SendMesseage(*req)
			if err != nil {
				log.Printf("Failed to save messeage to DB: %v", err)
			} else {
				log.Printf("Message saved to DB successfully. Created at: %d", res.CreatedAt)
			}
			log.Printf("Broadcasting message to Hub")
			h.hub.Broadcast <- &msg
		default:
			log.Printf("Unknown message type: %s", msg.Type)
		}
	}
}

func (h *WebSocketHandle) writePump(client *ws.Client) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(client.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
