package model

import (
	"database/sql"
	"time"
)

type Notification struct {
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	ActorID     int        `json:"actor_id"`
	Type        string     `json:"type"`
	CodePieceID *int       `json:"code_piece_id"`
	CommentID   *int       `json:"comment_id"`
	IsRead      int        `json:"is_read"`
	CreatedAt   time.Time  `json:"created_at"`
	Actor       *User      `json:"actor,omitempty"`
	CodePiece   *CodePiece `json:"code_piece,omitempty"`
}

func CreateNotification(db *sql.DB, n *Notification) error {
	_, err := db.Exec(
		`INSERT INTO notifications (user_id, actor_id, type, code_piece_id, comment_id) VALUES (?, ?, ?, ?, ?)`,
		n.UserID, n.ActorID, n.Type, n.CodePieceID, n.CommentID,
	)
	return err
}

func GetNotifications(db *sql.DB, userID int, limit int) ([]Notification, error) {
	rows, err := db.Query(
		`SELECT id, user_id, actor_id, type, code_piece_id, comment_id, is_read, created_at
		 FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ?`, userID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		var cpID, cmtID sql.NullInt64
		err := rows.Scan(&n.ID, &n.UserID, &n.ActorID, &n.Type, &cpID, &cmtID, &n.IsRead, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		if cpID.Valid {
			v := int(cpID.Int64)
			n.CodePieceID = &v
		}
		if cmtID.Valid {
			v := int(cmtID.Int64)
			n.CommentID = &v
		}
		actor, _ := GetUserByID(db, n.ActorID)
		n.Actor = actor
		if n.CodePieceID != nil {
			cp, _ := GetCodePieceByID(db, *n.CodePieceID)
			n.CodePiece = cp
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func MarkNotificationRead(db *sql.DB, id, userID int) error {
	_, err := db.Exec(`UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?`, id, userID)
	return err
}

func MarkAllNotificationsRead(db *sql.DB, userID int) error {
	_, err := db.Exec(`UPDATE notifications SET is_read=1 WHERE user_id=?`, userID)
	return err
}

func GetUnreadCount(db *sql.DB, userID int) (int, error) {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0`, userID).Scan(&count)
	return count, err
}
