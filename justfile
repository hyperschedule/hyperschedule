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
