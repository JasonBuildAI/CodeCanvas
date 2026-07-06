package model

import (
	"database/sql"
	"time"
)

type Comment struct {
	ID          int       `json:"id"`
	CodePieceID int       `json:"code_piece_id"`
	UserID      int       `json:"user_id"`
	Content     string    `json:"content"`
	ParentID    *int      `json:"parent_id"`
	CreatedAt   time.Time `json:"created_at"`
	Author      *User     `json:"author,omitempty"`
}

func CreateComment(db *sql.DB, c *Comment) error {
	result, err := db.Exec(
		`INSERT INTO comments (code_piece_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)`,
		c.CodePieceID, c.UserID, c.Content, c.ParentID,
	)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	c.ID = int(id)

	_, err = db.Exec(`UPDATE code_pieces SET comment_count = comment_count + 1 WHERE id=?`, c.CodePieceID)
	return err
}

func GetCommentsByPiece(db *sql.DB, pieceID int) ([]Comment, error) {
	rows, err := db.Query(
		`SELECT id, code_piece_id, user_id, content, parent_id, created_at
		 FROM comments WHERE code_piece_id=? ORDER BY created_at DESC`, pieceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var c Comment
		var parentID sql.NullInt64
		err := rows.Scan(&c.ID, &c.CodePieceID, &c.UserID, &c.Content, &parentID, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		if parentID.Valid {
			v := int(parentID.Int64)
			c.ParentID = &v
		}
		author, _ := GetUserByID(db, c.UserID)
		c.Author = author
		comments = append(comments, c)
	}
	return comments, nil
}

func DeleteComment(db *sql.DB, id, userID int) error {
	result, err := db.Exec(`DELETE FROM comments WHERE id=? AND user_id=?`, id, userID)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n > 0 {
		// Decrement count (simplified - we don't have the pieceID here easily)
		db.Exec(`UPDATE code_pieces SET comment_count = MAX(0, comment_count - 1) WHERE id IN (SELECT code_piece_id FROM comments WHERE id=?)`, id)
	}
	return nil
}
