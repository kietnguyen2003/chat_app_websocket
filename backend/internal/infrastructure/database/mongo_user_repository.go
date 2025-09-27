package database

import (
	auth "backend-chat-app/internal/domain/user"
	"backend-chat-app/internal/infrastructure/database/registry"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

// Register indexes khi package được import
func init() {
	userIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "refresh_token", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
		{
			Keys:    bson.D{{Key: "phone", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "create_at", Value: 1}},
		},
	}

	registry.RegisterCollection("users", userIndexes)
}

type MongoUserRepository struct {
	client     *mongo.Client
	database   string
	collection *mongo.Collection
}

func NewMongoUserRepository(client *mongo.Client, database string) *MongoUserRepository {
	collection := client.Database(database).Collection("users")
	return &MongoUserRepository{
		client:     client,
		database:   database,
		collection: collection,
	}
}

func (mr *MongoUserRepository) Create(user auth.User) (*auth.User, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	mongoUser := &MongoUser{
		Username:      user.Username,
		Password:      user.Password,
		Email:         user.Email,
		Role:          string(user.Role),
		Phone:         user.Phone,
		CreatedAt:     user.CreatedAt.Unix(),
		UpdateAt:      user.UpdateAt.Unix(),
		Conversations: []primitive.ObjectID{},
	}

	result, err := mr.collection.InsertOne(ctx, mongoUser)
	if err != nil {
		return nil, err
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		mongoUser.ID = oid
	}
	return mr.toDomainUser(*mongoUser), nil
}

func (mr *MongoUserRepository) GetByUsername(username string) (*auth.User, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	var mongoUser MongoUser
	err := mr.collection.FindOne(ctx, bson.M{"username": username}).Decode(&mongoUser)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return mr.toDomainUser(mongoUser), nil
}

func (mr *MongoUserRepository) toDomainUser(mongoUser MongoUser) *auth.User {
	var userID string
	if !mongoUser.ID.IsZero() {
		userID = mongoUser.ID.Hex()
	}

	// Convert []primitive.ObjectID to []string
	conversations := make([]string, len(mongoUser.Conversations))
	for i, convID := range mongoUser.Conversations {
		conversations[i] = convID.Hex()
	}

	return &auth.User{
		ID:                 userID,
		Username:           mongoUser.Username,
		Password:           mongoUser.Password,
		Email:              mongoUser.Email,
		Role:               auth.Role(mongoUser.Role),
		Phone:              mongoUser.Phone,
		RefreshToken:       mongoUser.RefreshToken,
		RefreshTokenExpiry: mongoUser.RefreshTokenExpiry,
		Conversations:      conversations,
		CreatedAt:          timeFromUnix(mongoUser.CreatedAt),
		UpdateAt:           timeFromUnix(mongoUser.UpdateAt),
	}
}

func (mr *MongoUserRepository) SaveRefreshToken(token string, userID string) error {
	ctx, cancel := withContextTimeout()
	defer cancel()

	hashToken, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		return errors.New(err.Error())
	}

	expiryTime := time.Now().Add(30 * 24 * time.Hour).Unix()

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user ID format")
	}

	filter := bson.M{"_id": objectID}
	update := bson.M{
		"$set": bson.M{
			"refresh_token":        string(hashToken),
			"refresh_token_expiry": expiryTime,
			"update_at":            time.Now().Unix(),
		},
	}

	_, err = mr.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return errors.New("failed to save refresh token: " + err.Error())
	}

	return nil
}

func (mr *MongoUserRepository) GetByID(userID string) (*auth.User, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}

	var mongoUser MongoUser
	filter := bson.M{"_id": objectID}
	err = mr.collection.FindOne(ctx, filter).Decode(&mongoUser)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return mr.toDomainUser(mongoUser), nil
}

func (mr *MongoUserRepository) Logout(userID string) error {
	ctx, cancel := withContextTimeout()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user ID format")
	}

	filter := bson.M{"_id": objectID}
	update := bson.M{
		"$set": bson.M{
			"refresh_token":        "",
			"refresh_token_expiry": 0,
			"update_at":            time.Now().Unix(),
		},
	}

	_, err = mr.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (mr *MongoUserRepository) GetByPhone(phone string) (*auth.User, error) {
	ctx, cancel := withContextTimeout()
	defer cancel()

	var mongoUser MongoUser
	err := mr.collection.FindOne(ctx, bson.M{"phone": phone}).Decode(&mongoUser)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return mr.toDomainUser(mongoUser), nil
}

func (mr *MongoUserRepository) AddConversationtoParticipants(mineID string, friendPhone string, conversationID string) error {
	ctx, cancel := withContextTimeout()
	defer cancel()

	// Convert conversationID string to ObjectID
	convObjID, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return errors.New("Invalid conversation ID format: " + err.Error())
	}

	// Convert mineID string to ObjectID
	mineObjID, err := primitive.ObjectIDFromHex(mineID)
	if err != nil {
		return errors.New("Invalid user ID format: " + err.Error())
	}

	// Update user1 by ID
	filter1 := bson.M{"_id": mineObjID}
	update1 := bson.M{
		"$addToSet": bson.M{
			"conversations": convObjID,
		},
		"$set": bson.M{
			"update_at": time.Now().Unix(),
		},
	}

	_, err = mr.collection.UpdateOne(ctx, filter1, update1)
	if err != nil {
		return errors.New("Error updating user1: " + err.Error())
	}

	// Update user2 by phone
	filter2 := bson.M{"phone": friendPhone}
	update2 := bson.M{
		"$addToSet": bson.M{
			"conversations": convObjID,
		},
		"$set": bson.M{
			"update_at": time.Now().Unix(),
		},
	}

	_, err = mr.collection.UpdateOne(ctx, filter2, update2)
	if err != nil {
		return errors.New("Error updating user2: " + err.Error())
	}

	return nil
}
