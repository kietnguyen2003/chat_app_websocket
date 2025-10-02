package websocket

import (
	"sync"

	"github.com/gorilla/websocket"
)

// đại diện cho 1 user
type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
	Hub  *Hub
}

type Hub struct {
	Clients       map[string]*Client // danh sách các client kết nối
	Conversations map[string]map[string]bool
	Register      chan *Client
	Unregister    chan *Client
	Broadcast     chan *Message
	mu            sync.RWMutex
}

type Message struct {
	ConversationID string `json:"conversation_id"`
	SenderID       string `json:"sender_id"`
	Messeage       string `json:"messeage"`
	CreatedAt      int64  `json:"created_at"`
	Type           string `json:"type"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:       make(map[string]*Client),
		Conversations: make(map[string]map[string]bool),
		Register:      make(chan *Client),
		Unregister:    make(chan *Client),
		Broadcast:     make(chan *Message, 256), // khai báo buffer bằng 256 vì kênh này hoạt động nhiều, tránh tính trạng treo
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register: // user kết nối với websocket
			h.mu.Lock()                   // đóng
			h.Clients[client.ID] = client // lưu vào danh sách kết nối
			h.mu.Unlock()                 // mở  lock
		case client := <-h.Unregister: // user ngắt kết nối với websocket
			h.mu.Lock()                            // đóng
			if _, ok := h.Clients[client.ID]; ok { // kiểm tra xem có client trong danh sách kn không
				delete(h.Clients, client.ID) // có thì xóa
				close(client.Send)           // đóng kết nối client với hub
			}
			h.mu.Unlock() // mở lock
		case messeage := <-h.Broadcast:
			h.mu.RLock()
			participants, ok := h.Conversations[messeage.ConversationID]
			h.mu.RUnlock()
			if !ok {
				continue
			}
			for userID := range participants {
				if userID == messeage.SenderID {
					continue
				}

				h.mu.RLock()
				client, ok := h.Clients[userID]
				h.mu.RUnlock()

				if ok {
					select {
					case client.Send <- []byte(messeage.Messeage):
					default:
						h.mu.Lock()
						close(client.Send)
						delete(h.Clients, userID)
						h.mu.Unlock()
					}
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
}
