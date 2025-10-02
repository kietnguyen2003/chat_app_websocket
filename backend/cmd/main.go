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

	router, hub := initial.SetupRouter(r, cfg.JWTKey, client)

	go hub.Run()
	log.Println("WebSocket hub started")

	log.Printf("Server is running on PORT %s", cfg.Port)
	log.Fatal(router.Run(":" + cfg.Port))
}
