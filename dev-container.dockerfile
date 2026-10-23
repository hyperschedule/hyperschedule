FROM docker:29.9.2-cli@sha256:5e6baf67325a79f64ed3bed6863954d5e05d0f3d4e57cbdb14809346814bbfdb AS docker-cli

# Inherit the application's official Node image. Its glibc also supports
# MongoMemoryServer, which the existing backend tests use.
FROM hyperschedule-dev-base
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl git openssh-client zsh libssl3 libcurl4 \
    && rm -rf /var/lib/apt/lists/*
# The host supplies the container engine; only its official CLI/plugins are needed.
COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker-cli /usr/local/libexec/docker/cli-plugins/ /usr/local/libexec/docker/cli-plugins/
COPY containers/devcontainer/install-shell.sh /tmp/install-shell.sh
RUN sh /tmp/install-shell.sh && rm /tmp/install-shell.sh
COPY containers/devcontainer/zshrc /root/.zshrc
ENV LANG=C.UTF-8

WORKDIR /srv/hyperschedule/
RUN ln -sf "../../hooks/pre-commit" .git/hooks/pre-commit \
    && ln -sf "../../hooks/post-merge" .git/hooks/post-merge \
    && ln -sf "../../hooks/post-checkout" .git/hooks/post-checkout
CMD ["/bin/bash"]
