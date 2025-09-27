package initial

import (
	"backend-chat-app/internal/application/auth"
	"backend-chat-app/internal/application/chat"
	"backend-chat-app/internal/application/user"
	"backend-chat-app/internal/infrastructure/database"
	"backend-chat-app/internal/interface/http"
	"backend-chat-app/internal/interface/http/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(r *gin.Engine, JWTSecret string, client *mongo.Client) *gin.Engine {
	userRepo := database.NewMongoUserRepository(client, "chat-app")
	conversationRepo := database.NewMongoConversationRepository(client, "chat-app")
	messeageRepo := database.NewMongoMesseageRepository(client, "chat-app")

	authService := auth.NewService(userRepo, JWTSecret)
	userService := user.NewUserService(userRepo)
	chatService := chat.NewChatService(messeageRepo, conversationRepo, userRepo)

	authHandle := http.NewAuthHandle(authService, JWTSecret)
	userHandle := http.NewUserHandle(userService)
	chatHandle := http.NewChatHandle(chatService)

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Orign", "Content-Type", "Authorization"},
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
	}

	chatGroup := r.Group("/chat")
	chatGroup.Use(authMiddleware)
	{
		chatGroup.POST("/send", chatHandle.SendMesseage)
		chatGroup.POST("/conversation", chatHandle.CreateConversation)
	}
	return r
}
