# Hyperschedule Production Backend Image
FROM node:26.12.1-bookworm-slim

# Install pnpm matching package.json packageManager
RUN npm install -g pnpm@10.34.8

WORKDIR /srv/hyperschedule

# Copy package manifests first for optimal layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig-base.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY data/package.json ./data/
COPY frontend/package.json ./frontend/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy application source files
COPY backend ./backend
COPY shared ./shared
COPY data ./data

WORKDIR /srv/hyperschedule
