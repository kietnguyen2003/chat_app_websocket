package database

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User table
type MongoUser struct {
	ID                 primitive.ObjectID   `bson:"_id,omitempty"`
	Username           string               `bson:"username"`
	Password           string               `bson:"password"`
	Email              string               `bson:"email"`
	Phone              string               `bson:"phone"`
	Role               string               `bson:"role"`
	Avatar             string               `bson:"avatar"`
	RefreshToken       string               `bson:"refresh_token,omitempty"`
	RefreshTokenExpiry int64                `bson:"refresh_token_expiry"`
	Conversations      []primitive.ObjectID `bson:"conversations"`
	CreatedAt          int64                `bson:"create_at"`
	UpdateAt           int64                `bson:"update_at"`
}

// Messeage Table
type MongoMesseage struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	ConversationID primitive.ObjectID `bson:"conversation_id"`
	Sender         primitive.ObjectID `bson:"sender_id"`
	Messeage       string             `bson:"messeage"`
	CreatedAt      int64              `bson:"created_at"`
}

// Conversation Table
type Participant struct {
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Name string             `bson:"name"`
}

type MongoConversation struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Participant []Participant      `bson:"participant"`
	CreatedAt   int64              `bson:"created_at"`
	UpdateAt    int64              `bson:"update_at"`
}
