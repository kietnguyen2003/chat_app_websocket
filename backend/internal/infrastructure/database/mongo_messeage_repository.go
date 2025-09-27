package database

import "go.mongodb.org/mongo-driver/mongo"

func NewMongoMesseageRepository(client *mongo.Client, database string) *MongoMesseageRepository {
	collection := client.Database(database).Collection("messeages")
	return &MongoMesseageRepository{
		client:     client,
		database:   database,
		collection: collection,
	}
}
