package initial

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	DBUrl  string
	JWTKey string
}

func LoadConfig() *Config {
	_ = godotenv.Load(".env")
	config := &Config{
		Port:   getEnv("PORT", "8080"),
		DBUrl:  getEnv("DATABASE_URL_LOCAL", "mongodb://localhost:27017/chat-app"),
		JWTKey: getEnv("JWT_SECRET", "default-jwt-secret"),
	}
	fmt.Println(config.DBUrl)
	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
