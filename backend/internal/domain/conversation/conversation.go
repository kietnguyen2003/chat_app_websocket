package conversation

type ConversationRepository interface {
	Create(conversation Conversation) (*Conversation, error)
	GetByID(conversationID string) (*Conversation, error)

	IsCommunicate(participant1ID string, participant2ID string) (bool, error)
}
