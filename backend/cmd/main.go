package main

import (
	"backend-chat-app/initial"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := initial.LoadConfig()

	client := initial.NewMongoConnection(cfg.DBUrl)

	r := gin.Default()

	initial.SetupRouter(r, cfg.JWTKey, client)
	log.Printf("Server is running on PORT %s", cfg.Port)
	log.Fatal(r.Run(":" + cfg.Port))
}
