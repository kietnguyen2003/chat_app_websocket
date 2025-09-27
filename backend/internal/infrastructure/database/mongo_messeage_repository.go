package database

import (
	"backend-chat-app/internal/domain/messeage"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoMesseageRepository struct {
	client     *mongo.Client
	database   string
	collection *mongo.Collection
}

func NewMongoMesseageRepository(client *mongo.Client, database string) *MongoMesseageRepository {
	collection := client.Database(database).Collection("messeages")
	return &MongoMesseageRepository{
		client:     client,
		database:   database,
		collection: collection,
	}
}

func (mm *MongoMesseageRepository) Create(messeage messeage.Messeage) (*messeage.Messeage, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	convObjectID, err := primitive.ObjectIDFromHex(messeage.ConversationID)
	if err != nil {
		return nil, err
	}

	senderObjectID, err := primitive.ObjectIDFromHex(messeage.SenderID)
	if err != nil {
		return nil, err
	}
	mongoMess := &MongoMesseage{
		ConversationID: convObjectID,
		Sender:         senderObjectID,
		Messeage:       messeage.Messeage,
		CreatedAt:      messeage.CreatedAt.Unix(),
	}
	result, err := mm.collection.InsertOne(ctx, mongoMess)
	if err != nil {
		return nil, err
	}
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		mongoMess.ID = oid
	}
	return mm.toDomainMesseage(*mongoMess), nil
}

func (mm *MongoMesseageRepository) toDomainMesseage(mongoMesseage MongoMesseage) *messeage.Messeage {
	return &messeage.Messeage{
		ConversationID: mongoMesseage.ConversationID.Hex(),
		SenderID:       mongoMesseage.Sender.Hex(),
		Messeage:       mongoMesseage.Messeage,
		CreatedAt:      timeFromUnix(mongoMesseage.CreatedAt),
	}
}

func (mm *MongoMesseageRepository) GetMessagesByConversationID(conversationID string) ([]*messeage.Messeage, error) {
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

	var mongoMessages []MongoMesseage
	if err = cursor.All(ctx, &mongoMessages); err != nil {
		return nil, err
	}

	messages := make([]*messeage.Messeage, len(mongoMessages))
	for i, mongoMess := range mongoMessages {
		messages[i] = mm.toDomainMesseage(mongoMess)
	}

	return messages, nil
}
