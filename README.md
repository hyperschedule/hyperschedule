# Hyperschedule v2

## Basic Dependencies

To run the code, you need to have at least one of these installed on your computer:

- [NodeJS](https://nodejs.org/en) and [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker](https://docs.docker.com/get-docker/) (and if necessary, Docker Desktop)

## Docker with Dev Containers

Remember the dev containers from CS70? If you liked it, you can use dev containers to develop Hyperschedule too. In
fact, you don't need to install anything else other than Docker. Just open the project in VSCode and you should be
all-set. If you don't want to use VSCode, run `yarn docker-dev` at the project root and you should get basically the
same thing (except its faster than VSCode and you can use IDE of your
choosing). If you don't have `yarn` installed either, run this in you terminal and it should drop you into a dev
container shell (fun fact: `yarn docker-dev` is a shortcut for this particular command)

```
docker compose \
    -f docker-compose.yml -f .devcontainer/docker-compose.yml \
    up --always-recreate-deps --wait && \
    docker compose exec dev /bin/zsh
```

The first time you set up your dev containers, you should run `yarn docker-load-db` to load the test data.

## Docker without Dev Containers

If you don't want to use a dev container and have some fancy editor setup (the previous and current Hyperschedule
maintainers have been big fans of emacs, vim, and WebStorm, respectively), you can still set up most of the stack with
Docker compose. Run `yarn install` at project root, and then run `yarn docker`. Similar to dev containers, you should
also run `yarn docker-load-db` to load the test data.

## Git hooks

To avoid accidentally pushing broken code, you should link the pre-commit hook
to automatically run tests before you commit things. No matter how your project
is set up, it is recommended that you run these commands at project root

```shell
ln -s "../../hooks/pre-commit" .git/hooks/pre-commit
ln -s "../../hooks/post-merge" .git/hooks/post-merge
ln -s "../../hooks/post-checkout" .git/hooks/post-checkout
```

## Manual Installations (No Docker)

Not a fan of Docker or dev containers? Good news, you don't have to use either. At project root, run `yarn install` to
install all the JavaScript dependencies.

Then, you need to install You also need to
install [MongoDB](https://www.mongodb.com/docs/manual/installation/) and set it up according to your OS. Make sure its
listening to port `27017` with username `hyperschedule` and password `local_dev`. Alternatively, you can set it up some
other way and modify the MongoDB connection string in [backend/.env.development](./backend/.env.development). After you
set it up, you can load the test data with this command (and modify the username and password if you used something
different):

``` 
mongorestore \
    --username 'hyperschedule' \
    --password 'local_dev' \
    --authenticationDatabase 'admin' \
    --nsInclude 'hyperschedule.sections' \
    --archive \
    --gzip \
    < 'data/db_dump'
```

Then, install [nginx](https://nginx.org/en/docs/njs/install.html) on your computer.
If you are not running Linux, you might have to compile nginx from the source. You can find
the nginx configuration file and the self-signed certificate we use at the [data/nginx](./data/nginx)
folder.

Lastly, run `yarn frontend` and `yarn backend` in two different terminals to start everything. 
