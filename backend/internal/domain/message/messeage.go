package message

type MessageRepository interface {
	Create(message Message) (*Message, error)
	GetMessagesByConversationID(conversation string) ([]*Message, error)
}
