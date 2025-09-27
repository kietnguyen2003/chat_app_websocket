package database

import (
	"backend-chat-app/internal/domain/conversation"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoConversationRepository struct {
	client     *mongo.Client
	database   string
	collection *mongo.Collection
}

func NewMongoConversationRepository(client *mongo.Client, database string) *MongoConversationRepository {
	collection := client.Database(database).Collection("conversations")
	return &MongoConversationRepository{
		client:     client,
		database:   database,
		collection: collection,
	}
}

func (cr *MongoConversationRepository) Create(conversation conversation.Conversation) (*conversation.Conversation, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()
	mongoConversation := &MongoConversation{
		CreatedAt: conversation.CreatedAt.Unix(),
		UpdateAt:  conversation.UpdateAt.Unix(),
	}
	result, err := cr.collection.InsertOne(ctx, mongoConversation)
	if err != nil {
		return nil, err
	}
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		mongoConversation.ID = oid
	}
	return cr.toDomainConversation(*mongoConversation), nil
}
func (cr *MongoConversationRepository) toDomainConversation(mongoConversation MongoConversation) *conversation.Conversation {
	var conversationID string
	if !mongoConversation.ID.IsZero() {
		conversationID = mongoConversation.ID.Hex()
	}

	return &conversation.Conversation{
		ID:        conversationID,
		CreatedAt: timeFromUnix(mongoConversation.CreatedAt),
		UpdateAt:  timeFromUnix(mongoConversation.UpdateAt),
	}
}
