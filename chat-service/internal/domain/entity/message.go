package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
	tiktoken_go "github.com/j178/tiktoken-go"
)

type Message struct {
	ID        string
	Role      string
	Content   string
	Tokens    int
	Model     *Model
	CreatedAt time.Time
}

func NewMessage(role, content string, model *Model) (*Message, error) {
	totalTokens := tiktoken_go.CountTokens(model.GetModelName(), content)
	message := &Message{
		ID:        uuid.New().String(),
		Role:      role,
		Content:   content,
		Tokens:    totalTokens,
		Model:     model,
		CreatedAt: time.Now(),
	}

	if err := message.Validate(); err != nil {
		return nil, errors.New("invalid role")
	}

	return message, nil
}

func (m *Message) Validate() error {
	validRoles := []string{"user", "system", "assistant"}
	isValidRole := false

	for _, role := range validRoles {
		if m.Role == role {
			isValidRole = true
			break
		}
	}

	if !isValidRole {
		return errors.New("invalid role")
	}

	if m.Content == "" {
		return errors.New("content is empty")
	}

	if m.CreatedAt.IsZero() {
		return errors.New("invalid created at")
	}

	return nil
}

func (m *Message) GetAmountTokens() int {
	return m.Tokens
}
