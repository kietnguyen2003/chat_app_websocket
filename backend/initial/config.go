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
	config := &Config{
		Port:   getEnv("PORT", "8080"),
		DBUrl:  getEnv("MONGO_URL", "default-db-url"),
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
