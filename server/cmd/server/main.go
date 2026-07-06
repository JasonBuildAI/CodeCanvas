package main

import (
	"fmt"
	"log"

	"codecanvas-server/internal/config"
	"codecanvas-server/internal/database"
	"codecanvas-server/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.NewDB(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	r := router.Setup(cfg, db)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
