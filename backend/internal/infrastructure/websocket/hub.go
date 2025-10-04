package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
	Hub  *Hub
}

type Hub struct {
	Clients       map[string]*Client
	Conversations map[string]map[string]bool
	Register      chan *Client
	Unregister    chan *Client
	Broadcast     chan *Message
	mu            sync.RWMutex
}

type Message struct {
	ConversationID string `json:"conversation_id"`
	SenderID       string `json:"sender_id"`
	Message        string `json:"message"`
	CreatedAt      int64  `json:"created_at"`
	Type           string `json:"type"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:       make(map[string]*Client),
		Conversations: make(map[string]map[string]bool),
		Register:      make(chan *Client),
		Unregister:    make(chan *Client),
		Broadcast:     make(chan *Message, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()

			onlineUsersList := make([]string, 0, len(h.Clients))
			for userID := range h.Clients {
				onlineUsersList = append(onlineUsersList, userID)
			}

			h.Clients[client.ID] = client
			h.mu.Unlock()

			// Gửi danh sách online users cho client mới
			for _, userID := range onlineUsersList {
				onlineNotif := Message{
					Type:      "user_online",
					SenderID:  userID,
					CreatedAt: time.Now().Unix(),
				}
				onlineNotifJSON, _ := json.Marshal(onlineNotif)
				select {
				case client.Send <- onlineNotifJSON:
				default:
				}
			}

			// Broadcast cho TẤT CẢ clients rằng user mới vừa online
			onlineMsg := Message{
				Type:      "user_online",
				SenderID:  client.ID,
				CreatedAt: time.Now().Unix(),
			}
			onlineMsgJSON, _ := json.Marshal(onlineMsg)

			h.mu.RLock()
			for _, c := range h.Clients {
				if c.ID == client.ID {
					continue
				}
				select {
				case c.Send <- onlineMsgJSON:
				default:
				}
			}
			h.mu.RUnlock()
		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)

				offlineMsg := Message{
					Type:      "user_offline",
					SenderID:  client.ID,
					CreatedAt: time.Now().Unix(),
				}
				offlineMsgJSON, _ := json.Marshal(offlineMsg)

				for _, c := range h.Clients {
					select {
					case c.Send <- offlineMsgJSON:
					default:
					}
				}
			}
			h.mu.Unlock()
		case message := <-h.Broadcast:
			h.mu.RLock()
			participants, ok := h.Conversations[message.ConversationID]
			h.mu.RUnlock()

			log.Printf("Broadcasting message in conversation %s. Participants found: %v, Count: %d",
				message.ConversationID, ok, len(participants))

			if !ok {
				log.Printf("No participants found for conversation %s. Skipping broadcast.", message.ConversationID)
				continue
			}

			messageJson, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshaling message: %v", err)
				continue
			}

			for userID := range participants {
				h.mu.RLock()
				client, ok := h.Clients[userID]
				h.mu.RUnlock()

				if ok {
					select {
					case client.Send <- messageJson:
						log.Printf("Message broadcasted to user %s in conversation %s", userID, message.ConversationID)
					default:
						h.mu.Lock()
						close(client.Send)
						delete(h.Clients, userID)
						h.mu.Unlock()
						log.Printf("Failed to send message to user %s, client removed", userID)
					}
				} else {
					log.Printf("User %s not online, skipping broadcast", userID)
				}
			}
		}
	}
}

func (h *Hub) JoinConversation(conversationID string, userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.Conversations[conversationID]; !ok {
		h.Conversations[conversationID] = make(map[string]bool)
	}
	h.Conversations[conversationID][userID] = true
	log.Printf("User %s joined conversation %s. Total participants: %d", userID, conversationID, len(h.Conversations[conversationID]))
}

func (h *Hub) IsOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, online := h.Clients[userID]
	return online
}

func (h *Hub) GetOnlineUser() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	users := make([]string, 0, len(h.Clients))
	for user := range h.Clients {
		users = append(users, user)
	}
	return users
}
