FROM hyperschedule-dev-base

RUN curl -fsSL https://get.docker.com | sh
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.5/zsh-in-docker.sh)" -- \
    -t robbyrussell \
    -p git \
    -p https://github.com/zsh-users/zsh-autosuggestions \
    -a "autoload -U promptinit; promptinit; prompt pure; PURE_GIT_PULL=0; export TERM=xterm-256color" \
    -a "export PATH=/srv/hyperschedule/node_modules/.bin:\$PATH"
RUN npm install --global pure-prompt

RUN ln -s "../../hooks/pre-commit" .git/hooks/pre-commit
RUN ln -s "../../hooks/post-merge" .git/hooks/post-merge
RUN ln -s "../../hooks/post-checkout" .git/hooks/post-checkout
