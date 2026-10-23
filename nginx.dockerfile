FROM nginx:1.30.6-alpine3.24

# nginx's image still bundles Brotli 1.2.0; Alpine 1.2.1 fixes CVE-2026-111497.
RUN apk upgrade --no-cache brotli-libs
