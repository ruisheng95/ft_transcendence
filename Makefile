all:
	@docker-compose -f docker-compose.yml up -d --build

up:
	@docker-compose -f docker-compose.yml up -d

down:
	@docker-compose -f docker-compose.yml down

clean:
	@docker stop $$(docker ps -qa) 2> /dev/null || true
	@docker rm -f $$(docker ps -qa) 2> /dev/null || true
	@docker rmi -f $$(docker images -qa) 2> /dev/null || true
	@docker volume rm $$(docker volume ls -q) 2> /dev/null || true
	@docker network rm $$(docker network ls -q) 2> /dev/null || true
	@echo "clean"

re: clean all

.PHONY : all up down clean re