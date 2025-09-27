package user

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
	Phone              string
	Avatar             string
	Role               Role
	RefreshToken       string
	RefreshTokenExpiry int64
	Conversations      []string
	CreatedAt          time.Time
	UpdateAt           time.Time
}

func NewUser(username, password, email string, role Role, phone string) (*User, error) {
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
	if phone == "" {
		return nil, errors.New("phone can not empty")
	}
	return &User{
		Username:  username,
		Password:  password,
		Email:     email,
		Role:      role,
		Phone:     phone,
		CreatedAt: time.Now(),
		UpdateAt:  time.Now(),
	}, nil
}
