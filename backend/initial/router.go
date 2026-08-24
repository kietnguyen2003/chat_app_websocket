package initial

import (
	"backend-chat-app/internal/application/auth"
	"backend-chat-app/internal/application/chat"
	"backend-chat-app/internal/application/user"
	"backend-chat-app/internal/infrastructure/database"
	ws "backend-chat-app/internal/infrastructure/websocket"
	"backend-chat-app/internal/interface/http"
	"backend-chat-app/internal/interface/http/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(r *gin.Engine, JWTSecret string, client *mongo.Client) (*gin.Engine, *ws.Hub) {
	hub := ws.NewHub()

	userRepo := database.NewMongoUserRepository(client, "chat-app")
	conversationRepo := database.NewMongoConversationRepository(client, "chat-app")
	messageRepo := database.NewMongoMessageRepository(client, "chat-app")

	authService := auth.NewService(userRepo, JWTSecret)
	userService := user.NewUserService(userRepo, conversationRepo)
	chatService := chat.NewChatService(messageRepo, conversationRepo, userRepo)

	authHandle := http.NewAuthHandle(authService, JWTSecret)
	userHandle := http.NewUserHandle(userService)
	chatHandle := http.NewChatHandle(chatService, hub)

	wsHandle := http.NewWebSocketHandle(hub, chatService)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://kitdev.vercel.app", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		AllowWebSockets:  true,
	}))

	authMiddleware := middleware.AuthMiddleware(*authService)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/login", authHandle.Login)
		authGroup.POST("/register", authHandle.Register)
		authGroup.POST("/refresh", authHandle.RefreshToken)
		authGroup.POST("/logout", authHandle.Logout)
	}

	userGroup := r.Group("/user")
	userGroup.Use(authMiddleware)
	{
		userGroup.POST("/find-by-phone", userHandle.FindUserByPhone)
		userGroup.GET("/conversation", userHandle.GetConversationList)

	}

	chatGroup := r.Group("/chat")
	chatGroup.Use(authMiddleware)
	{
		chatGroup.POST("/send", chatHandle.SendMessage)
		chatGroup.POST("/conversation", chatHandle.CreateConversation)
		chatGroup.GET("/conversation/:id", chatHandle.GetConversation)
	}

	// WebSocket endpoint - separate to avoid CORS preflight issues
	r.GET("/ws", authMiddleware, wsHandle.HandleWebSocket)
	return r, hub
}
