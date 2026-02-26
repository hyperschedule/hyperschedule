FROM node:25-bookworm

# Install pnpm
RUN npm install -g pnpm@10.13.1

COPY . /srv/hyperschedule/
WORKDIR /srv/hyperschedule/
