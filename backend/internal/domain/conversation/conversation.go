package conversation

type ConversationRepository interface {
	Create(conversation Conversation) (*Conversation, error)
}
