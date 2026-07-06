package model

import (
	"database/sql"
)

func ToggleLike(db *sql.DB, userID, pieceID int) (bool, error) {
	// Check if already liked
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM likes WHERE user_id=? AND code_piece_id=?`, userID, pieceID).Scan(&count)
	if err != nil {
		return false, err
	}

	if count > 0 {
		// Unlike
		_, err = db.Exec(`DELETE FROM likes WHERE user_id=? AND code_piece_id=?`, userID, pieceID)
		if err != nil {
			return false, err
		}
		_, err = db.Exec(`UPDATE code_pieces SET like_count = MAX(0, like_count - 1) WHERE id=?`, pieceID)
		return false, err
	}

	// Like
	_, err = db.Exec(`INSERT INTO likes (user_id, code_piece_id) VALUES (?, ?)`, userID, pieceID)
	if err != nil {
		return false, err
	}
	_, err = db.Exec(`UPDATE code_pieces SET like_count = like_count + 1 WHERE id=?`, pieceID)
	return true, err
}

func GetLikeStatus(db *sql.DB, userID, pieceID int) (bool, error) {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM likes WHERE user_id=? AND code_piece_id=?`, userID, pieceID).Scan(&count)
	return count > 0, err
}
