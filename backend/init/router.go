package initial

import (
	"backend-chat-app/internal/application/auth"
	"backend-chat-app/internal/infrastructure/database"
	"backend-chat-app/internal/interface/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(r *gin.Engine, JWTSecret string, client *mongo.Client) *gin.Engine {
	userRepo := database.NewMongoUserRepository(client, "chat-app")

	authService := auth.NewService(userRepo, JWTSecret)

	authHandle := http.NewAuthHandle(authService, JWTSecret)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Orign", "Content-Type", "Authorization"},
	}))

	r.POST("/auth/login", authHandle.Login)
	r.POST("/auth/register", authHandle.Register)
	r.POST("/auth/refresh", authHandle.RefreshToken)
	r.POST("/auth/logout", authHandle.Logout)
	return r
}
