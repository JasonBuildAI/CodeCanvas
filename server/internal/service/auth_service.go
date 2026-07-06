package service

import (
	"errors"
	"time"

	"codecanvas-server/internal/model"

	"database/sql"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db        *sql.DB
	jwtSecret string
}

func NewAuthService(db *sql.DB, jwtSecret string) *AuthService {
	return &AuthService{db: db, jwtSecret: jwtSecret}
}

func (s *AuthService) Register(username, email, password string) (*model.User, string, error) {
	// Check existing
	if _, err := model.GetUserByEmail(s.db, email); err == nil {
		return nil, "", errors.New("email already registered")
	}
	if _, err := model.GetUserByUsername(s.db, username); err == nil {
		return nil, "", errors.New("username already taken")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", errors.New("failed to hash password")
	}

	user := &model.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
	}

	if err := model.CreateUser(s.db, user); err != nil {
		return nil, "", errors.New("failed to create user")
	}

	// Reload to get ID
	user, _ = model.GetUserByEmail(s.db, email)

	token, err := s.generateToken(user.ID, user.Username)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) Login(email, password string) (*model.User, string, error) {
	user, err := model.GetUserByEmail(s.db, email)
	if err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	token, err := s.generateToken(user.ID, user.Username)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) generateToken(userID int, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
