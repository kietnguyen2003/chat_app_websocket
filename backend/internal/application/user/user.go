package user

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/domain/user"
	"errors"
)

type UserService struct {
	userRepo user.UserRepository
}

func NewUserService(userRepository user.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepository,
	}
}

func (us *UserService) FindUserByPhone(request application.FindUserByPhoneRequest) (*application.FindUserByPhoneResponse, error) {
	user, err := us.userRepo.GetByPhone(request.Phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("phone doesnt exists")
	}
	return &application.FindUserByPhoneResponse{
		Email:  user.Email,
		Avatar: user.Avatar,
		Phone:  user.Phone,
	}, nil
}
