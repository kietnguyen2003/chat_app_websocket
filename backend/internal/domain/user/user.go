package user

import (
	"errors"
	"time"
)

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
		Username: username,
		Password: password,
		Email:    email,
		Role:     role,
		Phone:    phone,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
	}, nil
}

// interface
type UserRepository interface {
	Create(user User) (*User, error)
	GetByUsername(username string) (*User, error)
	GetByID(userId string) (*User, error)
	GetByPhone(phone string) (*User, error)

	SaveRefreshToken(token string, userID string) error
	Logout(userID string) error
}
