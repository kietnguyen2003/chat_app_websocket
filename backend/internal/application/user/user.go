package user

import (
	"backend-chat-app/internal/domain/user"
	"errors"
)

type UserService struct {
	userRepo user.UserRepository
}

type FindUserByPhoneRequest struct {
	phone string
}

func NewUserService(userRepository user.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepository,
	}
}

func (us *UserService) FindUserByPhone(request FindUserByPhoneRequest) (*user.User, error) {
	user, err := us.userRepo.GetByPhone(request.phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("phone doesnt exists")
	}
	return user, nil
}
