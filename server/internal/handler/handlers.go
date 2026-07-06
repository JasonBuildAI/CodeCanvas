package handler

import (
	"database/sql"
	"net/http"
	"strconv"

	"codecanvas-server/internal/middleware"
	"codecanvas-server/internal/model"
	"codecanvas-server/internal/service"
	"codecanvas-server/internal/websocket"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required,min=3,max=20"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.auth.Register(req.Username, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.auth.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

type CodePieceHandler struct {
	db  *sql.DB
	hub *websocket.Hub
}

func NewCodePieceHandler(db *sql.DB, hub *websocket.Hub) *CodePieceHandler {
	return &CodePieceHandler{db: db, hub: hub}
}

func (h *CodePieceHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	tag := c.Query("tag")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 12
	}

	pieces, err := model.ListCodePieces(h.db, page, pageSize, tag, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load tags for each piece
	for i := range pieces.Data {
		tags, _ := model.GetTagsByPiece(h.db, pieces.Data[i].ID)
		pieces.Data[i].Tags = tags
	}

	c.JSON(http.StatusOK, pieces)
}

func (h *CodePieceHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	piece, err := model.GetCodePieceByID(h.db, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "piece not found"})
		return
	}

	model.IncrementViewCount(h.db, id)

	author, _ := model.GetUserByID(h.db, piece.UserID)
	piece.Author = author
	tags, _ := model.GetTagsByPiece(h.db, piece.ID)
	piece.Tags = tags

	if userID := middleware.GetUserID(c); userID > 0 {
		liked, _ := model.GetLikeStatus(h.db, userID, piece.ID)
		piece.Liked = liked
	}

	c.JSON(http.StatusOK, piece)
}

func (h *CodePieceHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		HTMLCode    string   `json:"html_code"`
		CSSCode     string   `json:"css_code"`
		JSCode      string   `json:"js_code"`
		IsPublic    bool     `json:"is_public"`
		Tags        []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isPublic := 0
	if req.IsPublic {
		isPublic = 1
	}

	piece := &model.CodePiece{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		HTMLCode:    req.HTMLCode,
		CSSCode:     req.CSSCode,
		JSCode:      req.JSCode,
		IsPublic:    isPublic,
	}

	if err := model.CreateCodePiece(h.db, piece); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(req.Tags) > 0 {
		model.AddTagsToPiece(h.db, piece.ID, req.Tags)
	}

	c.JSON(http.StatusCreated, piece)
}

func (h *CodePieceHandler) Update(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	existing, err := model.GetCodePieceByID(h.db, id)
	if err != nil || existing.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
		return
	}

	var req struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		HTMLCode    string   `json:"html_code"`
		CSSCode     string   `json:"css_code"`
		JSCode      string   `json:"js_code"`
		IsPublic    bool     `json:"is_public"`
		Tags        []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isPublic := 0
	if req.IsPublic {
		isPublic = 1
	}

	existing.Title = req.Title
	existing.Description = req.Description
	existing.HTMLCode = req.HTMLCode
	existing.CSSCode = req.CSSCode
	existing.JSCode = req.JSCode
	existing.IsPublic = isPublic

	if err := model.UpdateCodePiece(h.db, existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func (h *CodePieceHandler) Delete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := model.DeleteCodePiece(h.db, id, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *CodePieceHandler) Trending(c *gin.Context) {
	pieces, err := model.GetTrendingPieces(h.db, 6)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for i := range pieces {
		author, _ := model.GetUserByID(h.db, pieces[i].UserID)
		pieces[i].Author = author
		tags, _ := model.GetTagsByPiece(h.db, pieces[i].ID)
		pieces[i].Tags = tags
	}
	c.JSON(http.StatusOK, pieces)
}

type LikeHandler struct {
	db  *sql.DB
	hub *websocket.Hub
}

func NewLikeHandler(db *sql.DB, hub *websocket.Hub) *LikeHandler {
	return &LikeHandler{db: db, hub: hub}
}

func (h *LikeHandler) Toggle(c *gin.Context) {
	userID := middleware.GetUserID(c)
	pieceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	liked, err := model.ToggleLike(h.db, userID, pieceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Send notification if liked
	if liked {
		piece, _ := model.GetCodePieceByID(h.db, pieceID)
		if piece != nil && piece.UserID != userID {
			model.CreateNotification(h.db, &model.Notification{
				UserID:      piece.UserID,
				ActorID:     userID,
				Type:        "like",
				CodePieceID: &pieceID,
			})
			// WebSocket notification would go here
		}
	}

	c.JSON(http.StatusOK, gin.H{"liked": liked})
}

func (h *LikeHandler) Status(c *gin.Context) {
	userID := middleware.GetUserID(c)
	pieceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	liked, _ := model.GetLikeStatus(h.db, userID, pieceID)
	c.JSON(http.StatusOK, gin.H{"liked": liked})
}

type CommentHandler struct {
	db *sql.DB
}

func NewCommentHandler(db *sql.DB) *CommentHandler {
	return &CommentHandler{db: db}
}

func (h *CommentHandler) List(c *gin.Context) {
	pieceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	comments, err := model.GetCommentsByPiece(h.db, pieceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	pieceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		Content  string `json:"content" binding:"required"`
		ParentID *int   `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := &model.Comment{
		CodePieceID: pieceID,
		UserID:      userID,
		Content:     req.Content,
		ParentID:    req.ParentID,
	}

	if err := model.CreateComment(h.db, comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	author, _ := model.GetUserByID(h.db, userID)
	comment.Author = author

	// Notify piece owner
	piece, _ := model.GetCodePieceByID(h.db, pieceID)
	if piece != nil && piece.UserID != userID {
		model.CreateNotification(h.db, &model.Notification{
			UserID:      piece.UserID,
			ActorID:     userID,
			Type:        "comment",
			CodePieceID: &pieceID,
			CommentID:   &comment.ID,
		})
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *CommentHandler) Delete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id, err := strconv.Atoi(c.Param("cid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}
	if err := model.DeleteComment(h.db, id, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

type ForkHandler struct {
	db *sql.DB
}

func NewForkHandler(db *sql.DB) *ForkHandler {
	return &ForkHandler{db: db}
}

func (h *ForkHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	pieceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	forked, err := model.CreateFork(h.db, pieceID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, forked)
}

type TagHandler struct {
	db *sql.DB
}

func NewTagHandler(db *sql.DB) *TagHandler {
	return &TagHandler{db: db}
}

func (h *TagHandler) GetAll(c *gin.Context) {
	tags, err := model.GetAllTags(h.db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tags)
}

type UserHandler struct {
	db *sql.DB
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	user, err := model.GetUserByID(h.db, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetPieces(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	pieces, err := model.GetUserPieces(h.db, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for i := range pieces {
		author, _ := model.GetUserByID(h.db, pieces[i].UserID)
		pieces[i].Author = author
		tags, _ := model.GetTagsByPiece(h.db, pieces[i].ID)
		pieces[i].Tags = tags
	}
	c.JSON(http.StatusOK, pieces)
}

type SearchHandler struct {
	db *sql.DB
}

func NewSearchHandler(db *sql.DB) *SearchHandler {
	return &SearchHandler{db: db}
}

func (h *SearchHandler) Search(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize := 12

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query required"})
		return
	}

	pieces, err := model.SearchCodePieces(h.db, query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := range pieces.Data {
		tags, _ := model.GetTagsByPiece(h.db, pieces.Data[i].ID)
		pieces.Data[i].Tags = tags
	}

	c.JSON(http.StatusOK, pieces)
}

type NotificationHandler struct {
	db *sql.DB
}

func NewNotificationHandler(db *sql.DB) *NotificationHandler {
	return &NotificationHandler{db: db}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	notifications, err := model.GetNotifications(h.db, userID, 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, notifications)
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	model.MarkNotificationRead(h.db, id, userID)
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := middleware.GetUserID(c)
	model.MarkAllNotificationsRead(h.db, userID)
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID := middleware.GetUserID(c)
	count, _ := model.GetUnreadCount(h.db, userID)
	c.JSON(http.StatusOK, gin.H{"count": count})
}
