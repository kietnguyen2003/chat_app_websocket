package initial

import (
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

	dbURL := getEnv("MONGO_URL", "")
	if dbURL == "" {
		dbURL = getEnv("DATABASE_URL", "mongodb://localhost:27017/chat-app")
	}

	config := &Config{
		Port:   getEnv("PORT", "8080"),
		DBUrl:  dbURL,
		JWTKey: getEnv("JWT_SECRET", "default-jwt-secret"),
	}
	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
