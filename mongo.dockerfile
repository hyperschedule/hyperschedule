# Keep MongoDB's storage engine, runtime libraries, initialization, and UID/GID
# unchanged. Only its bundled helper programs are rebuilt below.
FROM golang:1.27.3-bookworm@sha256:972b4110ba0f47539a975c31e52c64765e1ff19f2d74469ae4a595c6676e80a5 AS go-toolchain

FROM mongo:7.0.45@sha256:c53852c00c23ca9f23fc39690350ffa9a80e3642fe8f96879726d8da0abe80a7 AS helpers

# Compile GSSAPI against the same Ubuntu/glibc baseline used by the runtime.
# These build dependencies never enter the final image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc=4:11.2.0-1ubuntu1 \
        libc6-dev=2.35-0ubuntu3.15 \
        libkrb5-dev=1.19.2-2ubuntu0.10 \
        curl=7.81.0-1ubuntu1.30 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=go-toolchain /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}" \
    GOTOOLCHAIN=local \
    GOMAXPROCS=2

# Pin upstream source commits and archive contents independently of movable tags.
RUN set -eux; \
    mkdir -p /src/gosu /src/tools /src/js-yaml /out; \
    curl -fsSL --retry 3 -o /tmp/gosu.tgz https://codeload.github.com/tianon/gosu/tar.gz/6456aaa0f3c854d199d0f037f068eb97515b7513; \
    echo '33d7537d588ea49458b9509bcf4554bdf5ceacc66da71e5caa1058ea3b689c3b  /tmp/gosu.tgz' | sha256sum -c -; \
    tar -xzf /tmp/gosu.tgz -C /src/gosu --strip-components=1; \
    curl -fsSL --retry 3 -o /tmp/tools.tgz https://codeload.github.com/mongodb/mongo-tools/tar.gz/9348e032419d906e40966f477278cce647b9b1eb; \
    echo '554c7f171a7b7d3ce42faf2c07112868173f9c008393ef4e7f0b861057c60980  /tmp/tools.tgz' | sha256sum -c -; \
    tar -xzf /tmp/tools.tgz -C /src/tools --strip-components=1; \
    curl -fsSL --retry 3 -o /tmp/js-yaml.tgz https://registry.npmjs.org/js-yaml/-/js-yaml-3.15.2.tgz; \
    echo '7f005cf0b8ee639b4557e0e321dc067c1f2aa0a442d096e03f2ab53353738794  /tmp/js-yaml.tgz' | sha256sum -c -; \
    tar -xzf /tmp/js-yaml.tgz -C /src/js-yaml --strip-components=1

# Exact module files retain upstream dependencies except the security updates:
# gosu: moby/sys/user 0.4.1 and x/sys 0.44.0; tools: x/net 0.60.0.
COPY containers/mongo/gosu/go.mod containers/mongo/gosu/go.sum /src/gosu/
COPY containers/mongo/tools/go.mod containers/mongo/tools/go.sum /src/tools/
COPY containers/mongo/build-helpers.sh /usr/local/bin/build-mongo-helpers
RUN sh /usr/local/bin/build-mongo-helpers

FROM mongo:7.0.45@sha256:c53852c00c23ca9f23fc39690350ffa9a80e3642fe8f96879726d8da0abe80a7

COPY --from=helpers /out/gosu /usr/local/bin/gosu
COPY --from=helpers /out/bsondump /out/mongodump /out/mongorestore /out/mongoimport /out/mongoexport /out/mongostat /out/mongotop /out/mongofiles /usr/bin/
COPY --from=helpers /src/js-yaml/dist/js-yaml.js /opt/js-yaml/dist/js-yaml.js
COPY --from=helpers /src/js-yaml/package.json /opt/js-yaml/package.json
