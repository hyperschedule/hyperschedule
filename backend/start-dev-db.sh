#!/usr/bin/env bash
set -euo pipefail

if ! docker info >/dev/null 2>&1; then
  echo $'\e[95mDocker daemon is not running (start docker desktop maybe?)\e[m'
  exit 1
fi

echo $'\e[95mChecking if container is already running\e[m'
if [ "$(docker container inspect -f '{{.State.Status}}' hyperschedule-mongodb 2>/dev/null)" == "running" ]; then
  echo $'\e[95mDatabase is already running\e[m'
else
  #echo $'\e[95mPulling mongodb docker image\e[m'
  #docker pull mongo

  echo $'\e[95mStarting container with name hyperschedule-mongodb\e[m'
  docker run --name hyperschedule-mongodb --rm -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=hyperschedule -e MONGO_INITDB_ROOT_PASSWORD=local_dev mongo
  export NODE_ENV=development

  echo $'\e[95mWaiting 5 seconds for database to start\e[m'
  sleep 5

  echo $'\e[95mInitializing database with sample data\e[m'
  node --enable-source-maps --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm ./src/db/init-db.ts
fi

echo $'\e[95mDone\e[m'
