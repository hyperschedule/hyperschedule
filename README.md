# Hyperschedule v2

Hyperschedule is a fast course scheduler for the Claremont Colleges. Currently live at [https://beta.hyperschedule.io/](https://beta.hyperschedule.io/).
![](docs/demo.gif)

## Basic Dependencies

To run the code, you need to have at least one of these installed on your computer:

- [NodeJS 18](https://nodejs.org/en) and [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker](https://docs.docker.com/get-docker/) (and if necessary, Docker Desktop)

## If you use Windows

Please install both `yarn` and `node` inside WSL2. Choose Debian Bullseyes if you aren't sure which distro to use, 
but other distros should be fine

## If you use MacOS

1. To run frontend properly, you need to [disable your Airplay Receiver](https://apple.stackexchange.com/a/431164) 
because there is a port conflict.
2. The `bash` that came with your macOS is likely still on version 3.2 (if you aren't sure, run `bash --version`), which
was released back in 2006. Please download a slightly more modern bash (as of Nov 2023, the latest version is 5.2.21).  

## Docker Compose Stack

**Services:**

- Frontend (port 5000)
- Backend (port 8080)
- Database (mongoDB)
- Web Server (nginx, port 80, only needed for SAML flow) 

**First time setup:**

At project root, run `yarn install`. Then, run `docker compose build`. Lastly, run `yarn docker` then `yarn docker-load-db` to load
test data. 

**After:**

Every you restarted your computer or Docker desktop, you need to run `yarn docker` again to start the stack.
Then go to `http://localhost:5000` in your browser. 

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
