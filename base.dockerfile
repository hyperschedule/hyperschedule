FROM node:18-bullseye

# install the linux version of all dependencies
RUN apt update && apt install -y git
COPY . /hyperschedule/

WORKDIR /srv
RUN git clone /hyperschedule
WORKDIR /srv/hyperschedule/
