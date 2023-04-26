create_migration:
	./pkg/golang-migrate/migrate create -ext=sql -dir=sql/migrations -seq init

migrate:
	./pkg/golang-migrate/migrate -path=sql/migrations -database "mysql://root:root@tcp(mysql:3306)/chat_service" -verbose up

migrate_down:
	./pkg/golang-migrate/migrate -path=sql/migrations -database "mysql://root:root@tcp(mysql:3306)/chat_service" -verbose drop

grpc:
	protoc --go_out=. --go-grpc_out=. proto/chat.proto --experimental_allow_proto3_optional

.PHONY: migrate create_migration migrate_down grpc
