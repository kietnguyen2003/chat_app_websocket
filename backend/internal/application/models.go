package application

type UserData struct {
	ID            string   `json:"user_id"`
	Name          string   `json:"name"`
	Conversations []string `json:"conversations"`
}
type TokenData struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
	User  UserData  `json:"user"`
	Token TokenData `json:"token"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
}
type RefreshTokenRequest struct {
	UserId       string `json:"userID"`
	RefreshToken string `json:"refresh_token"`
}

type FindUserByPhoneRequest struct {
	Phone string `json:"phone"`
}

type FindUserByPhoneResponse struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

type CreateConversationRequest struct {
	FriendPhone string `json:"friend_phone"`
	MineID      string `json:"user_id"`
}

type CreateConversationResponse struct {
	ID       string `json:"conversation_id"`
	FriendID string
}

type SendMessageRequest struct {
	Message        string `json:"message"`
	ConversationID string `json:"conversation_id"`
	SenderID       string `json:"sender_id"`
}

type SendMessageResponse struct {
	Message   string `json:"message"`
	CreatedAt int64  `json:"created_at"`
}

type Message struct {
	SenderID  string `json:"sender_id"`
	Message   string `json:"message"`
	CreatedAt int64  `json:"created_at"`
}
type GetConversationMessageResponse struct {
	ConversationID string    `json:"conversation_id"`
	Messages       []Message `json:"messages"`
}

type ParticipantInfo struct {
	ID   string `json:"_id"`
	Name string `json:"name"`
}

type Conversation struct {
	ID          string            `json:"conversation_id"`
	Participant []ParticipantInfo `json:"participant"`
}

type GetConversationListResponse struct {
	ConversationLists []Conversation `json:"conversation_list"`
}
