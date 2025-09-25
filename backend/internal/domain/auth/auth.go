package auth

import (
	"errors"
	"time"
)

// Role enum
type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

// ValidateRole checks if the role is valid
func ValidateRole(role Role) bool {
	return role == RoleUser || role == RoleAdmin
}

// entity
type User struct {
	ID                 string
	Username           string
	Password           string
	Email              string
	Role               Role
	RefreshToken       string
	RefreshTokenExpiry int64
	CreateAt           time.Time
	UpdateAt           time.Time
}

// bussiness rule
func NewUser(username, password, email string, role Role) (*User, error) {
	if username == "" {
		return nil, errors.New("username can not empty")
	}
	if password == "" {
		return nil, errors.New("password can not empty")
	}
	if email == "" {
		return nil, errors.New("email can not empty")
	}
	if !ValidateRole(role) {
		return nil, errors.New("invalid role")
	}
	return &User{
		Username: username,
		Password: password,
		Email:    email,
		Role:     role,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
	}, nil
}

// interface
type UserRepository interface {
	Create(user User) (*User, error)
	GetByUsername(username string) (*User, error)
	GetByID(userId string) (*User, error)

	SaveRefreshToken(token string, userID string) error
	Logout(userID string) error
}
