package messeage

import (
	"errors"
	"time"
)

type Messeage struct {
	ID             string
	ConversationID string
	SenderID       string
	Messeage       string
	CreatedAt      time.Time
}

func NewMesseage(conversation_id string, sender_id string, messeage string) (*Messeage, error) {
	if conversation_id == "" {
		return nil, errors.New("conversation_id can't empty")
	}
	if messeage == "" {
		return nil, errors.New("messeage can't empty")
	}
	return &Messeage{
		ConversationID: conversation_id,
		SenderID:       sender_id,
		Messeage:       messeage,
		CreatedAt:      time.Now(),
	}, nil
}
