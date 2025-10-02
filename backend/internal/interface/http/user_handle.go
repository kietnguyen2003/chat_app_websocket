package http

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/application/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserHandle struct {
	userService user.UserService
}

func NewUserHandle(userSer *user.UserService) *UserHandle {
	return &UserHandle{
		userService: *userSer,
	}
}

func (h *UserHandle) FindUserByPhone(c *gin.Context) {
	var req application.FindUserByPhoneRequest
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Can not get FindUserByPhone request data with err: "+err.Error()))
		return
	}
	res, resErr := h.userService.FindUserByPhone(req)
	if resErr != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, resErr.Error()))
		return
	}
	c.JSON(http.StatusCreated, SuccessResponse(res, "Find user successful"))
}

func (h *UserHandle) GetConversationList(c *gin.Context) {
	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Unauthorized"))
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, FailResponse(nil, "Invalid user ID format"))
		return
	}
	res, err := h.userService.GetConversationList(userIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, FailResponse(nil, "Failed to get conversation list: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, SuccessResponse(res, "Conversation list retrieved successfully"))
}
