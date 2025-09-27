package user

// interface
type UserRepository interface {
	Create(user User) (*User, error)
	GetByUsername(username string) (*User, error)
	GetByID(userId string) (*User, error)
	GetByPhone(phone string) (*User, error)

	SaveRefreshToken(token string, userID string) error
	Logout(userID string) error
	AddConversationtoParticipants(part1 string, parrt2 string, conversationID string) error
}
