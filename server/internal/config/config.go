package config

import "os"

type Config struct {
	Port         string
	DatabasePath string
	JWTSecret    string
	CORSOrigin   string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabasePath: getEnv("DB_PATH", "./codecanvas.db"),
		JWTSecret:    getEnv("JWT_SECRET", "codecanvas-dev-secret-key-2024"),
		CORSOrigin:   getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
