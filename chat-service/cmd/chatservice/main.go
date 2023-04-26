package main

import (
	"database/sql"
	"fmt"

	"github.com/Sup3r-Us3r/chat-ms/configs"
	"github.com/Sup3r-Us3r/chat-ms/internal/infra/grpc/server"
	"github.com/Sup3r-Us3r/chat-ms/internal/infra/repository"
	"github.com/Sup3r-Us3r/chat-ms/internal/infra/web"
	"github.com/Sup3r-Us3r/chat-ms/internal/infra/web/webserver"
	"github.com/Sup3r-Us3r/chat-ms/internal/usecase/chatcompletion"
	"github.com/Sup3r-Us3r/chat-ms/internal/usecase/chatcompletionstream"
	_ "github.com/go-sql-driver/mysql"
	"github.com/sashabaranov/go-openai"
)

func main() {
	configs := configs.LoadConfig(".")

	connection, err := sql.Open(
		configs.DBDriver,
		fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?parseTime=true&multiStatements=true",
			configs.DBUser,
			configs.DBPassword,
			configs.DBHost,
			configs.DBPort,
			configs.DBName,
		),
	)
	if err != nil {
		panic(err)
	}
	defer connection.Close()

	chatRepository := repository.NewChatRepositoryMySQL(connection)
	openAiClient := openai.NewClient(configs.OpenAIApiKey)

	chatConfig := chatcompletion.ChatCompletionConfigInputDTO{
		Model:                configs.Model,
		ModelMaxTokens:       configs.ModelMaxTokens,
		Temperature:          float32(configs.Temperature),
		TopP:                 float32(configs.TopP),
		N:                    configs.N,
		Stop:                 configs.Stop,
		MaxTokens:            configs.MaxTokens,
		InitialSystemMessage: configs.InitialChatMessage,
	}

	chatConfigStream := chatcompletionstream.ChatCompletionConfigInputDTO{
		Model:                configs.Model,
		ModelMaxTokens:       configs.ModelMaxTokens,
		Temperature:          float32(configs.Temperature),
		TopP:                 float32(configs.TopP),
		N:                    configs.N,
		Stop:                 configs.Stop,
		MaxTokens:            configs.MaxTokens,
		InitialSystemMessage: configs.InitialChatMessage,
	}

	usecase := chatcompletion.NewChatCompletionUseCase(chatRepository, openAiClient)

	streamChannel := make(chan chatcompletionstream.ChatCompletionOutputDTO)
	usecaseStream := chatcompletionstream.NewChatCompletionUseCase(chatRepository, openAiClient, streamChannel)

	fmt.Println("gRPC Server running on port " + configs.GRPCServerPort)
	grpcServer := server.NewGRPCServer(*usecaseStream, chatConfigStream, configs.GRPCServerPort, configs.AuthToken, streamChannel)
	go grpcServer.Start()

	webserver := webserver.NewWebServer(":" + configs.WebServerPort)
	webserverChatHandler := web.NewWebChatGPTHandler(*usecase, chatConfig, configs.AuthToken)
	webserver.AddHandler("/chat", webserverChatHandler.Handle)

	fmt.Println("Server running on port " + configs.WebServerPort)
	webserver.Start()
}
