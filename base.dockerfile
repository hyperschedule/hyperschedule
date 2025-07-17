FROM node:18-bullseye

# Install pnpm
RUN npm install -g pnpm@10.13.1

COPY . /srv/hyperschedule/
WORKDIR /srv/hyperschedule/
