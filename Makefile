IMAGE_NAME = dominion-app
CONTAINER_NAME = dominion-game
PORT = 3000
DEBUG_PORT = 9229

.PHONY: build run debug stop clean rebuild help

help:
	@echo "Available commands:"
	@echo "  make build   - Build the podman image"
	@echo "  make run     - Run the container in normal mode"
	@echo "  make debug   - Run the container in debug mode (inspect port 9229 enabled)"
	@echo "  make stop    - Stop and remove the container"
	@echo "  make clean   - Stop, remove container and remove image"
	@echo "  make rebuild - Rebuild the image from scratch"

build:
	podman build -t $(IMAGE_NAME) .

run: stop
	podman run -d --name $(CONTAINER_NAME) -p $(PORT):3000 $(IMAGE_NAME)
	@echo "App running at http://localhost:$(PORT)"

debug: stop
	podman run -it --name $(CONTAINER_NAME) -p $(PORT):3000 -p $(DEBUG_PORT):9229 $(IMAGE_NAME) pnpm dev:debug

stop:
	-podman stop $(CONTAINER_NAME)
	-podman rm $(CONTAINER_NAME)

clean: stop
	-podman rmi $(IMAGE_NAME)

rebuild: clean build
