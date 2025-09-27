package conversation

import (
	"time"
)

type Conversation struct {
	ID        string
	CreatedAt time.Time
	UpdateAt  time.Time
}

func NewConversation() (*Conversation, error) {
	return &Conversation{
		CreatedAt: time.Now(),
		UpdateAt:  time.Now(),
	}, nil
}
