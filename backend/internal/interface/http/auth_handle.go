package http

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/application/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandle struct {
	authService  auth.Service
	jwtSecretKey string
}

type ApiResponse struct {
	Status  string `json:"status"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

func SuccessResponse(data any, message string) *ApiResponse {
	return &ApiResponse{
		Status:  "success",
		Data:    data,
		Message: message,
	}
}

func FailResponse(data any, message string) *ApiResponse {
	return &ApiResponse{
		Status:  "fail",
		Data:    data,
		Message: message,
	}
}

func NewAuthHandle(authSer *auth.Service, jwtKey string) *AuthHandle {
	return &AuthHandle{
		authService:  *authSer,
		jwtSecretKey: jwtKey,
	}
}

func (h *AuthHandle) Register(c *gin.Context) {
	var req application.RegisterRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Can not get register request data with err: "+err.Error()))
		return
	}

	res, resErr := h.authService.Register(req)
	if resErr != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, resErr.Error()))
		return
	}
	c.JSON(http.StatusCreated, SuccessResponse(res, "Register successful"))
}

func (h *AuthHandle) Login(c *gin.Context) {
	var req application.LoginRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Can not get Login request data"))
		return
	}

	res, resErr := h.authService.Login(req)
	if resErr != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Login fail with error: "+resErr.Error()))
		return
	}

	c.JSON(http.StatusCreated, SuccessResponse(res, "Login successful"))
}

func (h *AuthHandle) RefreshToken(c *gin.Context) {
	var req application.RefreshTokenRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Can not get Refresh request data with err: "+err.Error()))
		return
	}
	res, err := h.authService.RefreshToken(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, err.Error()))
		return
	}
	c.JSON(http.StatusCreated, SuccessResponse(res, "RefreshToken successful"))
}

func (h *AuthHandle) Logout(c *gin.Context) {
	var req application.RefreshTokenRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Can not get Logout request data with err: "+err.Error()))
		return
	}
	err := h.authService.Logout(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, err.Error()))
		return
	}
	c.JSON(http.StatusOK, SuccessResponse(nil, "Logout successful"))
}
