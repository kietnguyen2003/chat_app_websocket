package registry

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

type IndexRegistry struct {
	collections map[string][]mongo.IndexModel
}

var registry = &IndexRegistry{
	collections: make(map[string][]mongo.IndexModel),
}

// RegisterCollection registers indexes for a collection
func RegisterCollection(name string, indexes []mongo.IndexModel) {
	registry.collections[name] = indexes
	log.Printf("Registered indexes for collection: %s", name)
}

// SetupAllIndexes creates indexes for all registered collections
func SetupAllIndexes(client *mongo.Client, dbName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db := client.Database(dbName)

	for collectionName, indexes := range registry.collections {
		collection := db.Collection(collectionName)

		if len(indexes) > 0 {
			_, err := collection.Indexes().CreateMany(ctx, indexes)
			if err != nil {
				log.Printf("Warning: Failed to create indexes for %s: %v",
					collectionName, err)
				return err
			} else {
				log.Printf("✓ Indexes created successfully for collection: %s", collectionName)
			}
		}
	}
	return nil
}
