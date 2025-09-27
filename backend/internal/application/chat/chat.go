package chat

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/domain/conversation"
	"backend-chat-app/internal/domain/messeage"
	"backend-chat-app/internal/domain/user"
	"errors"
	"fmt"
)

type ChatService struct {
	messeageRepo     messeage.MesseageRepository
	conversationRepo conversation.ConversationRepository
	userRepo         user.UserRepository
}

func NewChatService(messeageRepo messeage.MesseageRepository, conversationRepo conversation.ConversationRepository, userRepo user.UserRepository) *ChatService {
	return &ChatService{
		messeageRepo:     messeageRepo,
		conversationRepo: conversationRepo,
		userRepo:         userRepo,
	}
}

func (s *ChatService) CreateConversation(req application.CreateConversationRequest) (*application.CreateConversationResponse, error) {
	conversation, err := conversation.NewConversation()
	if err != nil {
		return nil, err
	}

	res, err := s.conversationRepo.Create(*conversation)
	if err != nil {
		return nil, err
	}
	err = s.userRepo.AddConversationtoParticipants(req.MineID, req.FriendPhone, res.ID)
	if err != nil {
		return nil, err
	}
	fmt.Println("Create conversation successfullt!!")
	return &application.CreateConversationResponse{
		ID: res.ID,
	}, nil
}

func (s *ChatService) SendMesseage(req application.SendMesseageRequest) (*application.SendMesseageResponse, error) {
	messeage, err := messeage.NewMesseage(req.ConversationID, req.SenderID, req.Messeage)
	if err != nil {
		return nil, errors.New("send messeage failed at NewMesseage: " + err.Error())
	}
	res, err := s.messeageRepo.Create(*messeage)
	if err != nil {
		return nil, errors.New("send messeage failed at CreateMesseage: " + err.Error())
	}

	return &application.SendMesseageResponse{
		Messeage:  res.Messeage,
		CreatedAt: res.CreatedAt.Unix(),
	}, nil
}

func (s *ChatService) GetConversation(conversationID string) (*application.GetConversationMesseageResponse, error) {

	messeages, err := s.messeageRepo.GetMessagesByConversationID(conversationID)
	if err != nil {
		return nil, err
	}
	// Convert *[]messeage.Messeage to []application.Messeage
	var appMesseages []application.Messeage
	for _, m := range messeages {
		appMesseages = append(appMesseages, application.Messeage{
			SenderID:  m.SenderID,
			Messeage:  m.Messeage,
			CreatedAt: m.CreatedAt.Unix(),
		})
	}
	return &application.GetConversationMesseageResponse{
		ConversationID: conversationID,
		Messeages:      appMesseages,
	}, nil
}
