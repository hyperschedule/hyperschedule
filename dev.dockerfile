FROM node:18-bullseye as tmp

# install the linux version of all dependencies
RUN apt update && apt install -y git
COPY . /hyperschedule/

WORKDIR /srv
RUN git clone /hyperschedule
WORKDIR /srv/hyperschedule/
RUN yarn install --immutable

FROM node:18-bullseye-slim
COPY --from=tmp /srv/hyperschedule/ /srv/hyperschedule
