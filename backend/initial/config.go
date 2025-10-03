package initial

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	DBUrl  string
	JWTKey string
	DBName string
}

func LoadConfig() *Config {
	if err := godotenv.Load("../.env"); err != nil {
		panic("No .env file found, using system environment variables")
	}
	config := &Config{
		Port:   getEnv("PORT", "8080"),
		DBUrl:  getEnv("DATABASE_URL_LOCAL", "default-db-url"),
		JWTKey: getEnv("JWT_SECRET", "default-jwt-secret"),
		DBName: getEnv("DBNAME", "default-db-name"),
	}
	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
