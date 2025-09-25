package initial

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewMongoConnection(mongoURI string) *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("MongoDB connected successfully!")

	// Setup indexes (equivalent to AutoMigrate)
	SetupMongoIndexes(client, "chat-app")

	return client
}

func SetupMongoIndexes(client *mongo.Client, dbName string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db := client.Database(dbName)
	usersCollection := db.Collection("users")

	// Create unique indexes for username and email
	indexes := []mongo.IndexModel{
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
			Keys: bson.D{{Key: "create_at", Value: 1}},
		},
	}

	_, err := usersCollection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		log.Printf("Warning: Failed to create some indexes: %v", err)
	} else {
		log.Println("MongoDB indexes created successfully!")
	}
}
