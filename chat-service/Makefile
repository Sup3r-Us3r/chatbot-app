create_migration:
	migrate create -ext=sql -dir=sql/migrations -seq init

migrate:
	migrate -path=sql/migrations -database "mysql://root:root@tcp(localhost:3306)/chat_service" -verbose up

migrate_down:
	migrate -path=sql/migrations -database "mysql://root:root@tcp(localhost:3306)/chat_service" -verbose drop	

grpc:
	protoc --go_out=. --go-grpc_out=. proto/chat.proto --experimental_allow_proto3_optional

.PHONY: migrate create_migration migrate_down grpc
