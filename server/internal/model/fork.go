package model

import (
	"database/sql"
	"time"
)

type Fork struct {
	ID        int       `json:"id"`
	SourceID  int       `json:"source_id"`
	ForkID    int       `json:"fork_id"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

func CreateFork(db *sql.DB, sourceID, userID int) (*CodePiece, error) {
	// Get source piece
	source, err := GetCodePieceByID(db, sourceID)
	if err != nil {
		return nil, err
	}

	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Create forked piece
	result, err := tx.Exec(
		`INSERT INTO code_pieces (user_id, title, description, html_code, css_code, js_code, is_public, fork_of)
		 VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
		userID, source.Title+" (Fork)", source.Description,
		source.HTMLCode, source.CSSCode, source.JSCode, sourceID,
	)
	if err != nil {
		return nil, err
	}
	forkID, _ := result.LastInsertId()

	// Record fork
	_, err = tx.Exec(
		`INSERT INTO forks (source_id, fork_id, user_id) VALUES (?, ?, ?)`,
		sourceID, forkID, userID,
	)
	if err != nil {
		return nil, err
	}

	// Increment source fork count
	_, err = tx.Exec(`UPDATE code_pieces SET fork_count = fork_count + 1 WHERE id=?`, sourceID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return GetCodePieceByID(db, int(forkID))
}
