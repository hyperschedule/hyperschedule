BIN := node_modules/.bin

SERVER := ./server.js
WATCH := $(BIN)/babel src -d out -D -w -q -s true

FIND_WEB_FILES := 			\
	find . \(			\
		-path ./.git -o		\
		-path ./node_modules -o	\
		-path ./out -o		\
		-name vendor		\
	\) -prune -o			\
	\( -name '*.css' -o -name '*.html' -o -name '*.js' \) -print

WEB_FILES := $(shell $(FIND_WEB_FILES))

.PHONY: all
all: build-prod

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf out

.PHONY: hooks
hooks: ## Install Git hooks
	@ln -sf ../../scripts/pre-commit .git/hooks/pre-commit

.PHONY: build
build: clean ## Compile JavaScript for development
	$(BIN)/babel src -d out -D -s true

.PHONY: build-prod
build-prod: clean ## Compile JavaScript for production
	$(BIN)/babel src -d out -D

.PHONY: server
server: ## Start development server
	@[[ -n "$$HYPERSCHEDULE_NO_HOOKS" ]] || make -s hooks
	$(SERVER)

.PHONY: watch
watch: clean ## Automatically recompile JavaScript on file changes
	$(WATCH)

.PHONY: dev
dev: ## Start development server and automatically recompile JavaScript
	@# Switching SERVER and WATCH breaks control-c inside Docker;
	@# I have no idea why.
	$(SERVER) & $(WATCH)

.PHONY: docker
docker: ## Start shell or run command (e.g. make docker CMD="make dev")
	@scripts/docker.bash "$(CMD)"

.PHONY: format
format: ## Auto-format JavaScript
	@$(BIN)/prettier --write $(WEB_FILES)

.PHONY: lint
lint: ## Verify that all code is correctly formatted
	@$(BIN)/prettier --check $(WEB_FILES)

.PHONY: ci
ci: build-prod lint ## Run tests that CI will run

.PHONY: help
help: ## Show this message
	@echo "usage:" >&2
	@grep -h "[#]# " $(MAKEFILE_LIST)	| \
		sed 's/^/  make /'		| \
		sed 's/:[^#]*[#]# /|/'		| \
		sed 's/%/LANG/'			| \
		column -t -s'|' >&2
