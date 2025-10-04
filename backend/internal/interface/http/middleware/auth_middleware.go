package middleware

import (
	"backend-chat-app/internal/application/auth"
	"net/http"
	"strings"

	// authService ""

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			tokenString = c.Query("token")
		}

		if tokenString == "" {
			// Check if this is a WebSocket upgrade request
			if c.GetHeader("Upgrade") == "websocket" {
				c.AbortWithStatus(http.StatusUnauthorized)
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
				c.Abort()
			}
			return
		}

		userID, err := authService.ValidateToken(tokenString)
		if err != nil {
			// Check if this is a WebSocket upgrade request
			if c.GetHeader("Upgrade") == "websocket" {
				c.AbortWithStatus(http.StatusUnauthorized)
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: " + err.Error()})
				c.Abort()
			}
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
