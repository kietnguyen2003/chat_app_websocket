package auth

import (
	"backend-chat-app/internal/domain/user"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	userRepo  user.UserRepository
	jwtSecret string
}

type UserData struct {
	ID   string `json:"user_id"`
	Role string `json:"role"`
}
type TokenData struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
	User  UserData  `json:"user"`
	Token TokenData `json:"token"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Role     string `json:"role,omitempty"`
	Phone    string `json:"phone"`
}
type RefreshTokenRequest struct {
	UserId       string `json:"userID"`
	RefreshToken string `json:"refresh_token"`
}

func NewService(userRepo user.UserRepository, jwtKeySecret string) *Service {
	return &Service{
		userRepo:  userRepo,
		jwtSecret: jwtKeySecret,
	}
}

// Login

func (s *Service) Login(request LoginRequest) (*AuthResponse, error) {
	user, err := s.userRepo.GetByUsername(request.Username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("username doesnt exists")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		return nil, errors.New("your password is wrong")
	}
	accessToken, refreshToken, err := s.generateAndSaveTokens(user)
	if err != nil {
		return nil, err
	}

	return s.createAuthResponse(user, accessToken, refreshToken), nil

}

// Register

func (s *Service) Register(request RegisterRequest) (*AuthResponse, error) {
	existingUser, err := s.userRepo.GetByUsername(request.Username)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("username already exists")
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Set default role if not provided
	role := user.RoleUser
	if request.Role != "" {
		role = user.Role(request.Role)
	}

	user, err := user.NewUser(request.Username, string(hashPassword), request.Email, role, request.Phone)
	if err != nil {
		return nil, err
	}

	resUser, err := s.userRepo.Create(*user)
	if err != nil {
		return nil, err
	}

	fmt.Print("Create user successfully: ", resUser)

	accessToken, refreshToken, err := s.generateAndSaveTokens(resUser)
	if err != nil {
		return nil, err
	}

	return s.createAuthResponse(resUser, accessToken, refreshToken), nil

}

// Refresh

func (s *Service) RefreshToken(req RefreshTokenRequest) (*AuthResponse, error) {
	user, err := s.userRepo.GetByID(req.UserId)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid user exists")
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.RefreshToken), []byte(req.RefreshToken))
	if err != nil {
		return nil, errors.New("wrong token")
	}

	accessToken, refreshToken, err := s.generateAndSaveTokens(user)
	if err != nil {
		return nil, err
	}

	return s.createAuthResponse(user, accessToken, refreshToken), nil
}

// Logout

func (s *Service) Logout(req RefreshTokenRequest) error {
	user, err := s.userRepo.GetByID(req.UserId)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("invalid user exists")
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.RefreshToken), []byte(req.RefreshToken))
	if err != nil {
		return errors.New("wrong token")
	}

	err = s.userRepo.Logout(user.ID)
	if err != nil {
		return errors.New("Logout fail")
	}
	return nil
}

// Helper functions
func (s *Service) createAuthResponse(user *user.User, accessToken, refreshToken string) *AuthResponse {
	return &AuthResponse{
		User: UserData{
			ID:   user.ID,
			Role: string(user.Role),
		},
		Token: TokenData{
			RefreshToken: refreshToken,
			AccessToken:  accessToken,
		},
	}
}

func (s *Service) generateAndSaveTokens(user *user.User) (string, string, error) {
	accessToken, refreshToken, err := s.generateToken(*user)
	if err != nil {
		return "", "", err
	}

	if refreshToken != user.RefreshToken {
		err = s.userRepo.SaveRefreshToken(refreshToken, user.ID)
		if err != nil {
			return "", "", err
		}
	}

	return accessToken, refreshToken, nil
}

func (s *Service) generateToken(user user.User) (string, string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	access_token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	refresh_token := hex.EncodeToString(bytes)
	tokenString, err := access_token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", err
	}
	return tokenString, refresh_token, nil
}

func (s *Service) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(string)
		if !ok {
			return "", errors.New("invalid token claims")
		}
		return userID, nil
	}
	return "", errors.New("invalid token")
}
