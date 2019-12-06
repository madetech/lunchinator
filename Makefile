UID ?= $(shell id -u)
DOCKER_COMPOSE = env UID=$(UID) docker-compose

.PHONY: shell
shell:
	$(DOCKER_COMPOSE) run app bash

