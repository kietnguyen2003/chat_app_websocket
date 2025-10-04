package database

import (
	"backend-chat-app/internal/domain/conversation"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
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

	// Convert domain Participant to Mongo Participant
	mongoParticipants := make([]Participant, len(conversation.Participant))
	for i, p := range conversation.Participant {
		objID, err := primitive.ObjectIDFromHex(p.ID)
		if err != nil {
			return nil, err
		}
		mongoParticipants[i] = Participant{
			ID:   objID,
			Name: p.Name,
		}
	}

	mongoConversation := &MongoConversation{
		Participant: mongoParticipants,
		CreatedAt:   conversation.CreatedAt.Unix(),
		UpdateAt:    conversation.UpdateAt.Unix(),
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

	// Convert Mongo Participant to domain Participant
	domainParticipants := make([]conversation.Participant, len(mongoConversation.Participant))
	for i, p := range mongoConversation.Participant {
		domainParticipants[i] = conversation.Participant{
			ID:   p.ID.Hex(),
			Name: p.Name,
		}
	}

	return &conversation.Conversation{
		ID:          conversationID,
		Participant: domainParticipants,
		CreatedAt:   timeFromUnix(mongoConversation.CreatedAt),
		UpdateAt:    timeFromUnix(mongoConversation.UpdateAt),
	}
}

func (cr *MongoConversationRepository) GetByID(conversationID string) (*conversation.Conversation, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()
	conversationObject, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return nil, err
	}
	var mongoConversation MongoConversation
	filter := bson.M{"_id": conversationObject}
	err = cr.collection.FindOne(ctx, filter).Decode(&mongoConversation)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return cr.toDomainConversation(mongoConversation), nil

}

func (cr *MongoConversationRepository) IsCommunicate(participant1ID string, participant2ID string) (bool, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	object1ID, err := primitive.ObjectIDFromHex(participant1ID)
	if err != nil {
		return false, err
	}
	object2ID, err := primitive.ObjectIDFromHex(participant2ID)
	if err != nil {
		return false, err
	}
	filter := bson.M{
		"participant._id": bson.M{
			"$all": []primitive.ObjectID{object1ID, object2ID},
		},
	}
	var mongoConversation MongoConversation
	err = cr.collection.FindOne(ctx, filter).Decode(&mongoConversation)
	if err == mongo.ErrNoDocuments {
		fmt.Println("No documents finded")
		return false, nil
	}
	if err != nil {
		fmt.Println("Hello: ", err.Error())
		return false, err
	}

	return true, nil
}
