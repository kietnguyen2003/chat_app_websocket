package message

import (
	"errors"
	"time"
)

type Message struct {
	ID             string
	ConversationID string
	SenderID       string
	Message        string
	CreatedAt      time.Time
}

func NewMessage(conversation_id string, sender_id string, message string) (*Message, error) {
	if conversation_id == "" {
		return nil, errors.New("conversation_id can't empty")
	}
	if message == "" {
		return nil, errors.New("message can't empty")
	}
	return &Message{
		ConversationID: conversation_id,
		SenderID:       sender_id,
		Message:        message,
		CreatedAt:      time.Now(),
	}, nil
}
