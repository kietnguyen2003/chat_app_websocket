package user

import (
	"errors"
	"time"
)

// entity
type User struct {
	ID                 string
	Username           string
	Password           string
	Email              string
	Phone              string
	Name               string
	RefreshToken       string
	RefreshTokenExpiry int64
	Conversations      []string
	CreatedAt          time.Time
	UpdateAt           time.Time
}

func NewUser(username, password, email string, name string, phone string) (*User, error) {
	if username == "" {
		return nil, errors.New("username can not empty")
	}
	if password == "" {
		return nil, errors.New("password can not empty")
	}
	if email == "" {
		return nil, errors.New("email can not empty")
	}
	if phone == "" {
		return nil, errors.New("phone can not empty")
	}
	if name == "" {
		return nil, errors.New("name can not empty")
	}
	return &User{
		Username:  username,
		Password:  password,
		Email:     email,
		Name:      name,
		Phone:     phone,
		CreatedAt: time.Now(),
		UpdateAt:  time.Now(),
	}, nil
}
