set positional-arguments

start-db:
  podman stop --ignore hyperschedule-mongodb
  podman run --rm -d \
    --name hyperschedule-mongodb \
    --publish 27017:27017 \
    --env MONGO_INITDB_ROOT_USERNAME=hyperschedule \
    --env MONGO_INITDB_ROOT_PASSWORD=local_dev \
    mongo

init-db:
  cd 'backend' \
    && NODE_ENV='development' DOTENV_CONFIG_PATH='.env.development' node \
      --enable-source-maps \
      --no-warnings \
      --require='dotenv/config' \
      --experimental-specifier-resolution='node' \
      --loader='ts-node/esm' \
      'src/db/init-db.ts'

load-db:
  docker-compose exec -T db \
    mongorestore \
    --username 'hyperschedule' \
    --password 'local_dev' \
    --authenticationDatabase 'admin' \
    --nsInclude 'hyperschedule.sections' \
    --archive \
    --gzip \
    < 'data/db_dump'

dump-db:
  podman exec hyperschedule-mongodb \
    mongodump \
    --db 'hyperschedule' \
    --collection 'sections' \
    --authenticationDatabase admin \
    --username hyperschedule \
    --password local_dev \
    --archive \
    --gzip \
    > 'data/db_dump'

download-data term:
  scp -rT "hyperschedule:/srv/hyperschedule/data/$1" "data/$1"

install-hooks:
  ln -s '../../hooks/pre-commit' '.git/hooks/pre-commit'
