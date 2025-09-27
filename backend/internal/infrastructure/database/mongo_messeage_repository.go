package database

import "go.mongodb.org/mongo-driver/bson/primitive"

type MongoMesseage struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	ConversationID primitive.ObjectID `bson:""`
	Sender         primitive.ObjectID `bson:""`
	Messeage       string             `bson:""`
	CreateAt       int64              `bson:""`
}
