.PHONY: all build run fclean re start stop list

COMPOSE_FILE = docker-compose.yml
DOCKER = docker

ifeq ($(shell uname), Darwin)
	IP_COMMAND = ipconfig getifaddr en0
else ifeq ($(shell uname), Linux)
	IP_COMMAND = hostname -I | awk '{print $$1}'
endif

ACTIVE_HOST = http://$(shell $(IP_COMMAND)):80/

all: run

build:
	@echo "Building all images..."
	@echo "Active Host IP is: $(shell $(IP_COMMAND))"
	ACTIVE_HOST=$(ACTIVE_HOST) $(DOCKER)-compose build --build-arg ACTIVE_HOST=$(ACTIVE_HOST)

run: build
	@echo "Running all containers..."
	$(DOCKER)-compose up -d
	@echo "Application is running in detached mode, use make stop to stop the running containers"

start:
	@echo "Starting containers..."
	$(DOCKER)-compose start

stop:
	@echo "Stopping containers..."
	$(DOCKER)-compose stop

list:
	@echo "Listing all containers..."
	$(DOCKER) ps -a

fclean: stop
	@echo "Removing all stopped containers..."
	$(DOCKER)-compose down --rmi all --volumes --remove-orphans
	find backend/api/media/avatars -mindepth 1 -delete 2>/dev/null

re: fclean run
