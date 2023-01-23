mongodb-version := '6.0.3'

start-db:
  podman run --rm -d \
    --name hyperschedule-mongodb \
    --publish 27017:27017 \
    --env MONGO_INITDB_ROOT_USERNAME=hyperschedule \
    --env MONGO_INITDB_ROOT_PASSWORD=local_dev \
  mongo
  NODE_ENV=development \
    node \
      --enable-source-maps \
      --no-warnings \
      --experimental-specifier-resolution=node \
      --loader ts-node/esm \
      ./src/db/init-db.ts

test:
  MONGOMS_DOWNLOAD_URL='https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel80-{{mongodb-version}}.tgz' \
  MONGOMS_VERSION='{{mongodb-version}}' \
    yarn test
