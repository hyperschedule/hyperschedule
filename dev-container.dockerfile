FROM hyperschedule-dev-base AS source

# MongoMemoryServer's Linux binaries require glibc, so the development container
# stays on Debian while the Compose application containers use Alpine.
FROM node:26.12.1-bookworm-slim

COPY --from=source /usr/local/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm
RUN ln -s ../lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm \
    && ln -s ../lib/node_modules/pnpm/bin/pnpx.cjs /usr/local/bin/pnpx \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=source /srv/hyperschedule/ /srv/hyperschedule/
WORKDIR /srv/hyperschedule/

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl wget git openssh-client zsh libssl3 libcurl4 \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://get.docker.com | sh
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.5/zsh-in-docker.sh)" -- \
    -t robbyrussell \
    -p git \
    -p https://github.com/zsh-users/zsh-autosuggestions \
    -a "autoload -U promptinit; promptinit; prompt pure; PURE_GIT_PULL=0; export TERM=xterm-256color" \
    -a "export PATH=/srv/hyperschedule/node_modules/.bin:\$PATH"
RUN PNPM_HOME=/usr/local/bin pnpm add --global --ignore-scripts pure-prompt \
    && mkdir -p /usr/local/share/zsh/site-functions \
    && ln -sf /usr/local/bin/global/5/node_modules/pure-prompt/pure.zsh /usr/local/share/zsh/site-functions/prompt_pure_setup \
    && ln -sf /usr/local/bin/global/5/node_modules/pure-prompt/async.zsh /usr/local/share/zsh/site-functions/async

RUN ln -sf "../../hooks/pre-commit" .git/hooks/pre-commit
RUN ln -sf "../../hooks/post-merge" .git/hooks/post-merge
RUN ln -sf "../../hooks/post-checkout" .git/hooks/post-checkout
