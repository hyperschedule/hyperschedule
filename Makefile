BIN := node_modules/.bin

SERVER := ./server.js
WATCH := $(BIN)/babel src -d out -D -w -q -s true

.PHONY: all
all: build-prod

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf out

.PHONY: build
build: clean ## Compile JavaScript for development
	$(BIN)/babel src -d out -D -s true

.PHONY: build-prod
build-prod: clean ## Compile JavaScript for production
	$(BIN)/babel src -d out -D

.PHONY: server
server: ## Start development server
	$(SERVER)

.PHONY: watch
watch: clean ## Automatically recompile JavaScript on file changes
	$(WATCH)

.PHONY: dev
dev: ## Start development server and automatically recompile JavaScript
	$(WATCH) &
	$(SERVER)

.PHONY: help
help: ## Show this message
	@echo "usage:" >&2
	@grep -h "[#]# " $(MAKEFILE_LIST)	| \
		sed 's/^/  make /'		| \
		sed 's/:[^#]*[#]# /|/'		| \
		sed 's/%/LANG/'			| \
		column -t -s'|' >&2
