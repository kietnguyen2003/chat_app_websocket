package initial

import (
	"backend-chat-app/internal/infrastructure/database/registry"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewMongoConnection(mongoURI string) *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI).SetServerSelectionTimeout(30 * time.Second).SetConnectTimeout(30 * time.Second).SetTLSConfig(nil)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	log.Println("MongoDB connected successfully!")

	err = registry.SetupAllIndexes(client, "chat-app")
	if err != nil {
		log.Fatal("Failed to setup MongoDB indexes:", err)
	}
	return client
}
