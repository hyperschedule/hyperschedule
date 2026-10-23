# 26.12.1 includes the October 2026 security release, including the Brotli RCE fix.
FROM node:26.12.1-bookworm-slim

# Install pnpm
RUN npm install -g pnpm@10.34.8 \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY . /srv/hyperschedule/
WORKDIR /srv/hyperschedule/
