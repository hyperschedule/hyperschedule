FROM hyperschedule-dev-base AS source

FROM node:26.12.1-bookworm-slim@sha256:28147155d47dc31abe0a46e0d12b59b2fb3d0a2dcc5dc65fce76a074180b16fe AS node

# Compose 5.6.1's published binary still includes vulnerable x/net. Rebuild the
# same release with the security dependency patch and a fixed Go toolchain.
FROM golang:1.27.3-bookworm@sha256:972b4110ba0f47539a975c31e52c64765e1ff19f2d74469ae4a595c6676e80a5 AS compose
ENV CGO_ENABLED=0 GOTOOLCHAIN=local GOMAXPROCS=2 GOFLAGS="-mod=readonly -p=2"
WORKDIR /src
RUN curl -fsSL https://github.com/docker/compose/archive/refs/tags/v5.6.1.tar.gz -o /tmp/compose.tar.gz \
    && echo 'bd1318503f131bc7f02538f153a7ead52f27ea30a99aee09f153a5dab9e6230a  /tmp/compose.tar.gz' | sha256sum -c - \
    && tar -xzf /tmp/compose.tar.gz --strip-components=1
COPY containers/devcontainer/compose-security.patch /tmp/compose-security.patch
RUN git apply --unidiff-zero /tmp/compose-security.patch \
    && go mod download \
    && go mod verify \
    && go build -trimpath \
        -ldflags '-w -X github.com/docker/compose/v5/internal.Version=v5.6.1-hyperschedule.1' \
        -o /out/docker-compose ./cmd

# Ubuntu's distro Brotli is not fixed yet. Build the upstream security release
# as a real replacement package, keeping package metadata and runtime in sync.
FROM ubuntu:26.04@sha256:c098726dd9b9733f3e885f8de0ef375206a311b0a317eadc40d347b1115fb944 AS brotli
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl cmake build-essential
COPY containers/devcontainer/build-brotli.sh /tmp/build-brotli.sh
RUN sh /tmp/build-brotli.sh

# glibc is required by MongoMemoryServer. Use the current LTS and security
# updates rather than the old Debian development packages.
FROM ubuntu:26.04@sha256:c098726dd9b9733f3e885f8de0ef375206a311b0a317eadc40d347b1115fb944
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl git openssh-client zsh libssl3t64 libcurl4t64 libstdc++6 libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    # This shell uses the host container engine, so its bundled Pebble
    # supervisor is unused and need not introduce another Go network service.
    && rm -f /usr/bin/pebble
COPY --from=brotli /out/libbrotli1.deb /tmp/libbrotli1.deb
RUN dpkg -i /tmp/libbrotli1.deb && ldconfig && rm /tmp/libbrotli1.deb
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/LICENSE /usr/local/share/doc/node/LICENSE
COPY --from=source /usr/local/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm
RUN ln -s ../lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm \
    && ln -s ../lib/node_modules/pnpm/bin/pnpx.cjs /usr/local/bin/pnpx
COPY --from=compose /out/docker-compose /usr/local/lib/docker/cli-plugins/docker-compose
COPY --from=compose /src/LICENSE /src/NOTICE /usr/local/share/doc/docker-compose/
COPY containers/devcontainer/install-tools.sh /tmp/install-tools.sh
RUN sh /tmp/install-tools.sh && rm /tmp/install-tools.sh
COPY containers/devcontainer/zshrc /root/.zshrc
ENV LANG=C.UTF-8

COPY --from=source /srv/hyperschedule/ /srv/hyperschedule/
WORKDIR /srv/hyperschedule/
RUN ln -sf "../../hooks/pre-commit" .git/hooks/pre-commit \
    && ln -sf "../../hooks/post-merge" .git/hooks/post-merge \
    && ln -sf "../../hooks/post-checkout" .git/hooks/post-checkout
CMD ["/bin/bash"]
