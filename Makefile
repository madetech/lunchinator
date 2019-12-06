UID ?= $(shell id -u)
DOCKER_COMPOSE = env UID=$(UID) docker-compose -f docker-compose.yml -f docker-compose.development.yml

.PHONY: shell
shell:
	$(DOCKER_COMPOSE) run app bash

.PHONY: spec
spec:
	$(DOCKER_COMPOSE) run app bash -c 'yarn run migrate-test up && yarn test'