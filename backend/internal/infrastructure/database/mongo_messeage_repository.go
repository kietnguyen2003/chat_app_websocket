package database

import (
	"backend-chat-app/internal/domain/message"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoMessageRepository struct {
	client     *mongo.Client
	database   string
	collection *mongo.Collection
}

func NewMongoMessageRepository(client *mongo.Client, database string) *MongoMessageRepository {
	collection := client.Database(database).Collection("messages")
	return &MongoMessageRepository{
		client:     client,
		database:   database,
		collection: collection,
	}
}

func (mm *MongoMessageRepository) Create(message message.Message) (*message.Message, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	convObjectID, err := primitive.ObjectIDFromHex(message.ConversationID)
	if err != nil {
		return nil, err
	}

	senderObjectID, err := primitive.ObjectIDFromHex(message.SenderID)
	if err != nil {
		return nil, err
	}
	mongoMess := &MongoMessage{
		ConversationID: convObjectID,
		Sender:         senderObjectID,
		Message:        message.Message,
		CreatedAt:      message.CreatedAt.Unix(),
	}
	result, err := mm.collection.InsertOne(ctx, mongoMess)
	if err != nil {
		return nil, err
	}
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		mongoMess.ID = oid
	}
	return mm.toDomainMessage(*mongoMess), nil
}

func (mm *MongoMessageRepository) toDomainMessage(mongoMessage MongoMessage) *message.Message {
	return &message.Message{
		ConversationID: mongoMessage.ConversationID.Hex(),
		SenderID:       mongoMessage.Sender.Hex(),
		Message:        mongoMessage.Message,
		CreatedAt:      timeFromUnix(mongoMessage.CreatedAt),
	}
}

func (mm *MongoMessageRepository) GetMessagesByConversationID(conversationID string) ([]*message.Message, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return nil, err
	}

	cursor, err := mm.collection.Find(ctx, bson.M{"conversation_id": objectID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var mongoMessages []MongoMessage
	if err = cursor.All(ctx, &mongoMessages); err != nil {
		return nil, err
	}

	messages := make([]*message.Message, len(mongoMessages))
	for i, mongoMess := range mongoMessages {
		messages[i] = mm.toDomainMessage(mongoMess)
	}

	return messages, nil
}
