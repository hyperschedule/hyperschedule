BIN := node_modules/.bin

FIND_WEB_FILES := 			\
	find . \(			\
		-path ./.git -o		\
		-path ./dist -o		\
		-path ./node_modules -o	\
		-path ./out -o		\
		-name vendor		\
	\) -prune -o			\
	\( -name '*.css' -o -name '*.html' -o -name '*.js' \) -print

WEB_FILES := $(shell $(FIND_WEB_FILES))

.PHONY: all
all: build

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf .cache dist out

.PHONY: hooks
hooks: ## Install Git hooks
	@ln -sf ../../scripts/pre-commit .git/hooks/pre-commit

.PHONY: build
build: ## Compile JavaScript for production
	$(BIN)/parcel build src/index.html

.PHONY: dev
dev: ## Start development server and automatically recompile JavaScript
	@[ -n "$$HYPERSCHEDULE_NO_HOOKS" ] || make -s hooks
	$(BIN)/parcel serve src/index.html \
		--port "$${PORT:-5000}" \
		--hmr-port "$${HMR_PORT:-54321}"


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
ci: build lint ## Run tests that CI will run

.PHONY: help
help: ## Show this message
	@echo "usage:" >&2
	@grep -h "[#]# " $(MAKEFILE_LIST)	| \
		sed 's/^/  make /'		| \
		sed 's/:[^#]*[#]# /|/'		| \
		sed 's/%/LANG/'			| \
		column -t -s'|' >&2
