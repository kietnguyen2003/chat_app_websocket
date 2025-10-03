package http

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/application/chat"
	ws "backend-chat-app/internal/infrastructure/websocket"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ChatHandle struct {
	chatService chat.ChatService
	hub         *ws.Hub
}

func NewChatHandle(chatService *chat.ChatService, hub *ws.Hub) *ChatHandle {
	return &ChatHandle{
		chatService: *chatService,
		hub:         hub,
	}
}

func (h *ChatHandle) CreateConversation(c *gin.Context) {
	var req application.CreateConversationRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Invalid request data: "+err.Error()))
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, FailResponse(nil, "Unauthorized"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, FailResponse(nil, "Invalid user ID format"))
		return
	}

	req.MineID = userIDStr

	res, err := h.chatService.CreateConversation(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Failed to create conversation: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, SuccessResponse(res, "Conversation created successfully"))
}

func (h *ChatHandle) SendMesseage(c *gin.Context) {
	var req application.SendMesseageRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Failed to send Messeage: "+err.Error()))
		return
	}
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, FailResponse(nil, "Unauthorized"))
		return
	}
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, FailResponse(nil, "Invalid user ID format"))
		return
	}
	req.SenderID = userIDStr
	res, err := h.chatService.SendMesseage(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Send messeage fail with err: "+err.Error()))
		return
	}
	if h.hub != nil {
		msgJSON, _ := json.Marshal(map[string]interface{}{
			"type":            "new_message",
			"conversation_id": req.ConversationID,
			"sender_id":       userIDStr,
			"messeage":        res.Messeage,
			"created_at":      res.CreatedAt,
		})

		h.hub.Broadcast <- &ws.Message{
			ConversationID: req.ConversationID,
			SenderID:       userIDStr,
			Messeage:       string(msgJSON),
			CreatedAt:      res.CreatedAt,
			Type:           "new_message",
		}
	}
	c.JSON(http.StatusCreated, SuccessResponse(res, "Message sent successfully"))
}

func (h *ChatHandle) GetConversation(c *gin.Context) {
	conversationId := c.Param("id")
	if conversationId == "" {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Failed to send Messeage"))
		return
	}
	res, err := h.chatService.GetConversation(conversationId)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Failed to send Messeage"))
		return
	}
	c.JSON(http.StatusCreated, SuccessResponse(res, "Conversation created successfully"))

}
