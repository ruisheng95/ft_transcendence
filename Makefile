all: build up

up:
	@docker-compose -f docker-compose.yml up -d

down:
	@docker-compose -f docker-compose.yml down

# Use build --no-cache to reset cache
build:
	@GOOGLE_CLIENT_ID="changeme" docker-compose -f docker-compose.yml build

clean: down
	@docker rmi -f $$(docker images --format '{{.Repository}}:{{.Tag}}' | grep 'ft-transcendence-*')
	@echo "clean"

re: clean all

.PHONY : all up down build clean re