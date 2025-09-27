package user

import "time"

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
	CreateAt           time.Time
	UpdateAt           time.Time
}
