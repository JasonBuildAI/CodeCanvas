package router

import (
	"database/sql"
	"net/http"

	"codecanvas-server/internal/config"
	"codecanvas-server/internal/handler"
	"codecanvas-server/internal/middleware"
	"codecanvas-server/internal/service"
	"codecanvas-server/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	gorillaWS "github.com/gorilla/websocket"
)

var upgrader = gorillaWS.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for WebSocket
	},
}

func Setup(cfg *config.Config, db *sql.DB) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS(cfg.CORSOrigin))

	// Services
	authService := service.NewAuthService(db, cfg.JWTSecret)

	// WebSocket Hub
	hub := websocket.NewHub()

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	codePieceHandler := handler.NewCodePieceHandler(db, hub)
	likeHandler := handler.NewLikeHandler(db, hub)
	commentHandler := handler.NewCommentHandler(db)
	forkHandler := handler.NewForkHandler(db)
	tagHandler := handler.NewTagHandler(db)
	userHandler := handler.NewUserHandler(db)
	searchHandler := handler.NewSearchHandler(db)
	notificationHandler := handler.NewNotificationHandler(db)

	// Auth middleware
	authRequired := middleware.AuthRequired(cfg.JWTSecret)

	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "codecanvas"})
	})

	// WebSocket endpoint
	r.GET("/api/ws", func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token required"})
			return
		}

		claims := &middleware.Claims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})
		if err != nil || !parsedToken.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}

		client := websocket.NewClient(hub, conn, claims.UserID)
		hub.Register(client)

		go client.WritePump()
		go client.ReadPump()
	})

	// Public endpoints
	r.POST("/api/auth/register", authHandler.Register)
	r.POST("/api/auth/login", authHandler.Login)

	// Code Pieces
	r.GET("/api/code-pieces", codePieceHandler.List)
	r.GET("/api/code-pieces/trending", codePieceHandler.Trending)
	r.GET("/api/code-pieces/:id", codePieceHandler.GetByID)
	r.POST("/api/code-pieces", authRequired, codePieceHandler.Create)
	r.PUT("/api/code-pieces/:id", authRequired, codePieceHandler.Update)
	r.DELETE("/api/code-pieces/:id", authRequired, codePieceHandler.Delete)

	// Likes
	r.POST("/api/code-pieces/:id/like", authRequired, likeHandler.Toggle)
	r.DELETE("/api/code-pieces/:id/like", authRequired, likeHandler.Toggle)
	r.GET("/api/code-pieces/:id/like/status", authRequired, likeHandler.Status)

	// Comments
	r.GET("/api/code-pieces/:id/comments", commentHandler.List)
	r.POST("/api/code-pieces/:id/comments", authRequired, commentHandler.Create)
	r.DELETE("/api/code-pieces/:id/comments/:cid", authRequired, commentHandler.Delete)

	// Forks
	r.POST("/api/code-pieces/:id/fork", authRequired, forkHandler.Create)

	// Tags
	r.GET("/api/tags", tagHandler.GetAll)

	// Users
	r.GET("/api/users/:id", userHandler.GetProfile)
	r.GET("/api/users/:id/code-pieces", userHandler.GetPieces)

	// Search
	r.GET("/api/search", searchHandler.Search)

	// Notifications
	r.GET("/api/notifications", authRequired, notificationHandler.List)
	r.PUT("/api/notifications/:id/read", authRequired, notificationHandler.MarkRead)
	r.PUT("/api/notifications/read-all", authRequired, notificationHandler.MarkAllRead)
	r.GET("/api/notifications/unread-count", authRequired, notificationHandler.UnreadCount)

	return r
}
