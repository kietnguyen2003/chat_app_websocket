package initial

import (
	"log"
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
		DBUrl:  getEnv("DATABASE_URL", getEnv("MONGO_URL", "")),
		JWTKey: getEnv("JWT_SECRET", "default-jwt-secret"),
	}
	if config.DBUrl == "default-db-url" {
		log.Println("Crash")
	}
	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
