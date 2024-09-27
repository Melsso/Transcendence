.PHONY: all build run fclean re start stop list

COMPOSE_FILE = docker-compose.yml
# DOCKER = docker

DOCKER = docker


all: run

build:
	@echo "Building all images..."
	$(DOCKER)-compose build

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

re: fclean run
