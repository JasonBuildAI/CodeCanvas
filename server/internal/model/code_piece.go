package model

import (
	"database/sql"
	"fmt"
	"time"
)

type CodePiece struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	HTMLCode     string    `json:"html_code"`
	CSSCode      string    `json:"css_code"`
	JSCode       string    `json:"js_code"`
	IsPublic     int       `json:"is_public"`
	ForkOf       *int      `json:"fork_of"`
	ViewCount    int       `json:"view_count"`
	LikeCount    int       `json:"like_count"`
	CommentCount int       `json:"comment_count"`
	ForkCount    int       `json:"fork_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Author       *User     `json:"author,omitempty"`
	Tags         []Tag     `json:"tags,omitempty"`
	Liked        bool      `json:"liked,omitempty"`
}

type PaginatedPieces struct {
	Data       []CodePiece `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

func CreateCodePiece(db *sql.DB, p *CodePiece) error {
	result, err := db.Exec(
		`INSERT INTO code_pieces (user_id, title, description, html_code, css_code, js_code, is_public, fork_of)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		p.UserID, p.Title, p.Description, p.HTMLCode, p.CSSCode, p.JSCode, p.IsPublic, p.ForkOf,
	)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	p.ID = int(id)
	return nil
}

func GetCodePieceByID(db *sql.DB, id int) (*CodePiece, error) {
	p := &CodePiece{}
	var forkOf sql.NullInt64
	err := db.QueryRow(
		`SELECT id, user_id, title, description, html_code, css_code, js_code, is_public, fork_of,
		        view_count, like_count, comment_count, fork_count, created_at, updated_at
		 FROM code_pieces WHERE id = ?`, id,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Description, &p.HTMLCode, &p.CSSCode, &p.JSCode,
		&p.IsPublic, &forkOf, &p.ViewCount, &p.LikeCount, &p.CommentCount, &p.ForkCount, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if forkOf.Valid {
		v := int(forkOf.Int64)
		p.ForkOf = &v
	}
	return p, nil
}

func UpdateCodePiece(db *sql.DB, p *CodePiece) error {
	_, err := db.Exec(
		`UPDATE code_pieces SET title=?, description=?, html_code=?, css_code=?, js_code=?, is_public=?, updated_at=CURRENT_TIMESTAMP
		 WHERE id=? AND user_id=?`,
		p.Title, p.Description, p.HTMLCode, p.CSSCode, p.JSCode, p.IsPublic, p.ID, p.UserID,
	)
	return err
}

func DeleteCodePiece(db *sql.DB, id, userID int) error {
	_, err := db.Exec(`DELETE FROM code_pieces WHERE id=? AND user_id=?`, id, userID)
	return err
}

func ListCodePieces(db *sql.DB, page, pageSize int, tag string, userID int) (*PaginatedPieces, error) {
	offset := (page - 1) * pageSize

	var count int
	var pieces []CodePiece
	var err error

	if tag != "" {
		err = db.QueryRow(
			`SELECT COUNT(*) FROM code_pieces cp
			 JOIN code_piece_tags cpt ON cp.id = cpt.code_piece_id
			 JOIN tags t ON cpt.tag_id = t.id
			 WHERE cp.is_public=1 AND t.name=?`, tag,
		).Scan(&count)
		if err != nil {
			return nil, err
		}

		rows, err := db.Query(
			`SELECT cp.id, cp.user_id, cp.title, cp.description, cp.html_code, cp.css_code, cp.js_code,
			        cp.is_public, cp.fork_of, cp.view_count, cp.like_count, cp.comment_count, cp.fork_count,
			        cp.created_at, cp.updated_at
			 FROM code_pieces cp
			 JOIN code_piece_tags cpt ON cp.id = cpt.code_piece_id
			 JOIN tags t ON cpt.tag_id = t.id
			 WHERE cp.is_public=1 AND t.name=?
			 ORDER BY cp.created_at DESC LIMIT ? OFFSET ?`, tag, pageSize, offset,
		)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		pieces, err = scanPieces(rows)
		if err != nil {
			return nil, err
		}
	} else {
		err = db.QueryRow(`SELECT COUNT(*) FROM code_pieces WHERE is_public=1`).Scan(&count)
		if err != nil {
			return nil, err
		}

		rows, err := db.Query(
			`SELECT id, user_id, title, description, html_code, css_code, js_code,
			        is_public, fork_of, view_count, like_count, comment_count, fork_count,
			        created_at, updated_at
			 FROM code_pieces WHERE is_public=1
			 ORDER BY created_at DESC LIMIT ? OFFSET ?`, pageSize, offset,
		)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		pieces, err = scanPieces(rows)
		if err != nil {
			return nil, err
		}
	}

	totalPages := (count + pageSize - 1) / pageSize

	// Load authors
	for i := range pieces {
		author, _ := GetUserByID(db, pieces[i].UserID)
		pieces[i].Author = author
	}

	return &PaginatedPieces{
		Data:       pieces,
		Total:      count,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func GetTrendingPieces(db *sql.DB, limit int) ([]CodePiece, error) {
	rows, err := db.Query(
		`SELECT id, user_id, title, description, html_code, css_code, js_code,
		        is_public, fork_of, view_count, like_count, comment_count, fork_count,
		        created_at, updated_at
		 FROM code_pieces WHERE is_public=1
		 ORDER BY like_count DESC LIMIT ?`, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPieces(rows)
}

func IncrementViewCount(db *sql.DB, id int) error {
	_, err := db.Exec(`UPDATE code_pieces SET view_count = view_count + 1 WHERE id=?`, id)
	return err
}

func SearchCodePieces(db *sql.DB, query string, page, pageSize int) (*PaginatedPieces, error) {
	offset := (page - 1) * pageSize

	var count int
	err := db.QueryRow(
		`SELECT COUNT(*) FROM code_pieces_fts WHERE code_pieces_fts MATCH ?`, query,
	).Scan(&count)
	if err != nil {
		return nil, fmt.Errorf("search count: %w", err)
	}

	rows, err := db.Query(
		`SELECT cp.id, cp.user_id, cp.title, cp.description, cp.html_code, cp.css_code, cp.js_code,
		        cp.is_public, cp.fork_of, cp.view_count, cp.like_count, cp.comment_count, cp.fork_count,
		        cp.created_at, cp.updated_at
		 FROM code_pieces_fts fts
		 JOIN code_pieces cp ON fts.rowid = cp.id
		 WHERE cp.is_public=1 AND code_pieces_fts MATCH ?
		 ORDER BY rank LIMIT ? OFFSET ?`, query, pageSize, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	pieces, err := scanPieces(rows)
	if err != nil {
		return nil, err
	}

	totalPages := (count + pageSize - 1) / pageSize
	for i := range pieces {
		author, _ := GetUserByID(db, pieces[i].UserID)
		pieces[i].Author = author
	}

	return &PaginatedPieces{
		Data:       pieces,
		Total:      count,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func scanPieces(rows *sql.Rows) ([]CodePiece, error) {
	var pieces []CodePiece
	for rows.Next() {
		var p CodePiece
		var forkOf sql.NullInt64
		err := rows.Scan(&p.ID, &p.UserID, &p.Title, &p.Description, &p.HTMLCode, &p.CSSCode, &p.JSCode,
			&p.IsPublic, &forkOf, &p.ViewCount, &p.LikeCount, &p.CommentCount, &p.ForkCount, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		if forkOf.Valid {
			v := int(forkOf.Int64)
			p.ForkOf = &v
		}
		pieces = append(pieces, p)
	}
	return pieces, nil
}

func GetUserPieces(db *sql.DB, userID int) ([]CodePiece, error) {
	rows, err := db.Query(
		`SELECT id, user_id, title, description, html_code, css_code, js_code,
		        is_public, fork_of, view_count, like_count, comment_count, fork_count,
		        created_at, updated_at
		 FROM code_pieces WHERE user_id=? AND is_public=1
		 ORDER BY created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPieces(rows)
}
