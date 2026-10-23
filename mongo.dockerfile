FROM node:26.12.1-alpine3.24 AS yaml

# Preserve MongoDB's js-yaml 3 API while fixing its bundled YAML parser.
RUN npm pack --pack-destination /tmp js-yaml@3.15.2 \
    && mkdir /tmp/js-yaml \
    && tar -xzf /tmp/js-yaml-3.15.2.tgz -C /tmp/js-yaml --strip-components=1

FROM mongo:7.0.45

COPY --from=yaml /tmp/js-yaml/dist/js-yaml.js /opt/js-yaml/dist/js-yaml.js
COPY --from=yaml /tmp/js-yaml/package.json /opt/js-yaml/package.json
