package chat

import (
	"backend-chat-app/internal/application"
	"backend-chat-app/internal/domain/conversation"
	"backend-chat-app/internal/domain/message"
	"backend-chat-app/internal/domain/user"
	"errors"
	"fmt"
)

type ChatService struct {
	messageRepo      message.MessageRepository
	conversationRepo conversation.ConversationRepository
	userRepo         user.UserRepository
}

func NewChatService(messageRepo message.MessageRepository, conversationRepo conversation.ConversationRepository, userRepo user.UserRepository) *ChatService {
	return &ChatService{
		messageRepo:      messageRepo,
		conversationRepo: conversationRepo,
		userRepo:         userRepo,
	}
}

func (s *ChatService) CreateConversation(req application.CreateConversationRequest) (*application.CreateConversationResponse, error) {
	currentUser, err := s.userRepo.GetByID(req.MineID)
	if err != nil {
		return nil, errors.New("failed to get current user: " + err.Error())
	}
	if currentUser == nil {
		return nil, errors.New("current user not found")
	}

	friendUser, err := s.userRepo.GetByPhone(req.FriendPhone)
	if err != nil {
		return nil, errors.New("failed to get friend user: " + err.Error())
	}
	if friendUser == nil {
		return nil, errors.New("friend user not found")
	}

	check, err := s.conversationRepo.IsCommunicate(currentUser.ID, friendUser.ID)
	if err != nil {
		return nil, errors.New("failed to check communicate: " + err.Error())
	}
	if check {
		return nil, errors.New("they have conversation yet")
	}
	fmt.Println("Is communicated?: ", check)

	participants := []conversation.Participant{
		{
			ID:   currentUser.ID,
			Name: currentUser.Name,
		},
		{
			ID:   friendUser.ID,
			Name: friendUser.Name,
		},
	}

	newConversation, err := conversation.NewConversation(participants)
	if err != nil {
		return nil, err
	}

	res, err := s.conversationRepo.Create(*newConversation)
	if err != nil {
		return nil, err
	}

	// Add conversation ID vào cả 2 users
	err = s.userRepo.AddConversationtoParticipants(req.MineID, req.FriendPhone, res.ID)
	if err != nil {
		return nil, err
	}

	fmt.Println("Create conversation successfully!!")
	return &application.CreateConversationResponse{
		ID:       res.ID,
		FriendID: friendUser.ID,
	}, nil
}

func (s *ChatService) SendMessage(req application.SendMessageRequest) (*application.SendMessageResponse, error) {
	message, err := message.NewMessage(req.ConversationID, req.SenderID, req.Message)
	if err != nil {
		return nil, errors.New("send message failed at NewMessage: " + err.Error())
	}
	res, err := s.messageRepo.Create(*message)
	if err != nil {
		return nil, errors.New("send message failed at CreateMessage: " + err.Error())
	}

	return &application.SendMessageResponse{
		Message:   res.Message,
		CreatedAt: res.CreatedAt.Unix(),
	}, nil
}

func (s *ChatService) GetConversation(conversationID string) (*application.GetConversationMessageResponse, error) {

	messages, err := s.messageRepo.GetMessagesByConversationID(conversationID)
	if err != nil {
		return nil, err
	}
	// Convert *[]message.Message to []application.Message
	var appMessages []application.Message
	for _, m := range messages {
		appMessages = append(appMessages, application.Message{
			SenderID:  m.SenderID,
			Message:   m.Message,
			CreatedAt: m.CreatedAt.Unix(),
		})
	}
	return &application.GetConversationMessageResponse{
		ConversationID: conversationID,
		Messages:       appMessages,
	}, nil
}
