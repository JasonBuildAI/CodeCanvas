package model

import (
	"database/sql"
)

type Tag struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

func GetAllTags(db *sql.DB) ([]Tag, error) {
	rows, err := db.Query(`SELECT id, name, color FROM tags ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Color); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func GetTagsByPiece(db *sql.DB, pieceID int) ([]Tag, error) {
	rows, err := db.Query(
		`SELECT t.id, t.name, t.color FROM tags t
		 JOIN code_piece_tags cpt ON t.id = cpt.tag_id
		 WHERE cpt.code_piece_id=?`, pieceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Color); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func EnsureTag(db *sql.DB, name string) (int, error) {
	// Try to insert, ignore conflict
	result, err := db.Exec(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, name)
	if err != nil {
		return 0, err
	}
	id, _ := result.LastInsertId()
	if id > 0 {
		return int(id), nil
	}
	// Tag already exists, fetch it
	var tagID int
	err = db.QueryRow(`SELECT id FROM tags WHERE name=?`, name).Scan(&tagID)
	return tagID, err
}

func AddTagsToPiece(db *sql.DB, pieceID int, tagNames []string) error {
	for _, name := range tagNames {
		tagID, err := EnsureTag(db, name)
		if err != nil {
			return err
		}
		_, err = db.Exec(`INSERT OR IGNORE INTO code_piece_tags (code_piece_id, tag_id) VALUES (?, ?)`, pieceID, tagID)
		if err != nil {
			return err
		}
	}
	return nil
}
