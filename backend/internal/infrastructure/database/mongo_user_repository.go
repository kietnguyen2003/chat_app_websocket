package database

import (
	auth "backend-chat-app/internal/domain/user"
	"backend-chat-app/internal/infrastructure/database/registry"
	"context"
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

type MongoUser struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty"`
	Username           string             `bson:"username"`
	Password           string             `bson:"password"`
	Email              string             `bson:"email"`
	Phone              string             `bson:"phone"`
	Role               string             `bson:"role"`
	Avatar             string             `bson:"avatar"`
	RefreshToken       string             `bson:"refresh_token,omitempty"`
	RefreshTokenExpiry int64              `bson:"refresh_token_expiry"`
	CreateAt           int64              `bson:"create_at"`
	UpdateAt           int64              `bson:"update_at"`
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoUser := &MongoUser{
		Username: user.Username,
		Password: user.Password,
		Email:    user.Email,
		Role:     string(user.Role),
		Phone:    user.Phone,
		CreateAt: user.CreateAt.Unix(),
		UpdateAt: user.UpdateAt.Unix(),
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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

	return &auth.User{
		ID:                 userID,
		Username:           mongoUser.Username,
		Password:           mongoUser.Password,
		Email:              mongoUser.Email,
		Role:               auth.Role(mongoUser.Role),
		Phone:              mongoUser.Phone,
		RefreshToken:       mongoUser.RefreshToken,
		RefreshTokenExpiry: mongoUser.RefreshTokenExpiry,
		CreateAt:           timeFromUnix(mongoUser.CreateAt),
		UpdateAt:           timeFromUnix(mongoUser.UpdateAt),
	}
}

func timeFromUnix(i int64) time.Time {
	return time.Unix(i, 0)
}

func (mr *MongoUserRepository) SaveRefreshToken(token string, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
