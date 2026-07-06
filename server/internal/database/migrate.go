package database

import (
	"database/sql"
	"fmt"
)

func AutoMigrate(db *sql.DB) error {
	schema := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id              INTEGER PRIMARY KEY AUTOINCREMENT,
			username        TEXT    NOT NULL UNIQUE,
			email           TEXT    NOT NULL UNIQUE,
			password_hash   TEXT    NOT NULL,
			display_name    TEXT    NOT NULL DEFAULT '',
			avatar_url      TEXT    NOT NULL DEFAULT '',
			bio             TEXT    NOT NULL DEFAULT '',
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS code_pieces (
			id              INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title           TEXT    NOT NULL DEFAULT 'Untitled',
			description     TEXT    NOT NULL DEFAULT '',
			html_code       TEXT    NOT NULL DEFAULT '',
			css_code        TEXT    NOT NULL DEFAULT '',
			js_code         TEXT    NOT NULL DEFAULT '',
			is_public       INTEGER NOT NULL DEFAULT 1,
			fork_of         INTEGER REFERENCES code_pieces(id) ON DELETE SET NULL,
			view_count      INTEGER NOT NULL DEFAULT 0,
			like_count      INTEGER NOT NULL DEFAULT 0,
			comment_count   INTEGER NOT NULL DEFAULT 0,
			fork_count      INTEGER NOT NULL DEFAULT 0,
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_code_pieces_user_id ON code_pieces(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_code_pieces_is_public_created ON code_pieces(is_public, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_code_pieces_like_count ON code_pieces(like_count DESC)`,
		`CREATE TABLE IF NOT EXISTS tags (
			id      INTEGER PRIMARY KEY AUTOINCREMENT,
			name    TEXT NOT NULL UNIQUE,
			color   TEXT NOT NULL DEFAULT '#6366f1'
		)`,
		`CREATE TABLE IF NOT EXISTS code_piece_tags (
			code_piece_id   INTEGER NOT NULL REFERENCES code_pieces(id) ON DELETE CASCADE,
			tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
			PRIMARY KEY (code_piece_id, tag_id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_code_piece_tags_tag_id ON code_piece_tags(tag_id)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id              INTEGER PRIMARY KEY AUTOINCREMENT,
			code_piece_id   INTEGER NOT NULL REFERENCES code_pieces(id) ON DELETE CASCADE,
			user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			content         TEXT    NOT NULL,
			parent_id       INTEGER REFERENCES comments(id) ON DELETE CASCADE,
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_comments_code_piece_id ON comments(code_piece_id)`,
		`CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)`,
		`CREATE TABLE IF NOT EXISTS likes (
			user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			code_piece_id   INTEGER NOT NULL REFERENCES code_pieces(id) ON DELETE CASCADE,
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, code_piece_id)
		)`,
		`CREATE TABLE IF NOT EXISTS forks (
			id              INTEGER PRIMARY KEY AUTOINCREMENT,
			source_id       INTEGER NOT NULL REFERENCES code_pieces(id) ON DELETE CASCADE,
			fork_id         INTEGER NOT NULL REFERENCES code_pieces(id) ON DELETE CASCADE,
			user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(source_id, fork_id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_forks_source_id ON forks(source_id)`,
		`CREATE INDEX IF NOT EXISTS idx_forks_user_id ON forks(user_id)`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id              INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			actor_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			type            TEXT    NOT NULL,
			code_piece_id   INTEGER REFERENCES code_pieces(id) ON DELETE CASCADE,
			comment_id      INTEGER REFERENCES comments(id) ON DELETE CASCADE,
			is_read         INTEGER NOT NULL DEFAULT 0,
			created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC)`,
	}

	for _, s := range schema {
		if _, err := db.Exec(s); err != nil {
			return fmt.Errorf("migrate: %w\nSQL: %s", err, s)
		}
	}

	// FTS5 virtual table (may not be available in all SQLite builds)
	ftsSQL := `CREATE VIRTUAL TABLE IF NOT EXISTS code_pieces_fts USING fts5(
		title, description, content='code_pieces', content_rowid='id'
	)`
	if _, err := db.Exec(ftsSQL); err != nil {
		// FTS5 may not be available, skip
		fmt.Println("Note: FTS5 not available, full-text search disabled")
	} else {
		// Create triggers to keep FTS index in sync
		triggers := []string{
			`CREATE TRIGGER IF NOT EXISTS code_pieces_ai AFTER INSERT ON code_pieces BEGIN
				INSERT INTO code_pieces_fts(rowid, title, description) VALUES (new.id, new.title, new.description);
			END`,
			`CREATE TRIGGER IF NOT EXISTS code_pieces_ad AFTER DELETE ON code_pieces BEGIN
				INSERT INTO code_pieces_fts(code_pieces_fts, rowid, title, description) VALUES ('delete', old.id, old.title, old.description);
			END`,
			`CREATE TRIGGER IF NOT EXISTS code_pieces_au AFTER UPDATE ON code_pieces BEGIN
				INSERT INTO code_pieces_fts(code_pieces_fts, rowid, title, description) VALUES ('delete', old.id, old.title, old.description);
				INSERT INTO code_pieces_fts(rowid, title, description) VALUES (new.id, new.title, new.description);
			END`,
		}
		for _, t := range triggers {
			db.Exec(t) // Best effort
		}
	}

	return nil
}
