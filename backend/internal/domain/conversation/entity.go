package conversation

import (
	"time"
)

type Participant struct {
	ID   string
	Name string
}

type Conversation struct {
	ID          string
	Participant []Participant
	CreatedAt   time.Time
	UpdateAt    time.Time
}

func NewConversation(participants []Participant) (*Conversation, error) {
	return &Conversation{
		Participant: participants,
		CreatedAt:   time.Now(),
		UpdateAt:    time.Now(),
	}, nil
}
