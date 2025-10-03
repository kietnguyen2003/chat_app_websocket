package user

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/domain/conversation"
	"backend-chat-app/internal/domain/user"
	"errors"
)

type UserService struct {
	userRepo         user.UserRepository
	conversationRepo conversation.ConversationRepository
}

func NewUserService(userRepository user.UserRepository, conversationRepo conversation.ConversationRepository) *UserService {
	return &UserService{
		userRepo:         userRepository,
		conversationRepo: conversationRepo,
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
		Email: user.Email,
		Name:  user.Name,
		Phone: user.Phone,
	}, nil
}

func (us *UserService) GetConversationList(userID string) (*application.GetConversationListResponse, error) {
	conversations, err := us.userRepo.GetConversationList(userID)
	if err != nil {
		return nil, err
	}
	if conversations == nil {
		return nil, errors.New("doesnt have any conversation")
	}
	var response application.GetConversationListResponse
	for _, conversationID := range conversations {
		if conversationID == nil {
			continue
		}
		res, err := us.conversationRepo.GetByID(*conversationID)
		if err != nil {
			return nil, err
		}
		if res == nil {
			continue
		}
		participants := make([]application.ParticipantInfo, 0, len(res.Participant))
		for _, p := range res.Participant {
			participants = append(participants, application.ParticipantInfo{
				ID:   p.ID,
				Name: p.Name,
			})
		}
		conversationModel := application.Conversation{
			ID:          res.ID,
			Participant: participants,
		}
		response.ConversationLists = append(response.ConversationLists, conversationModel)
	}
	return &response, nil
}
