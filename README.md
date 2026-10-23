# Hyperschedule v2

Hyperschedule is a fast course scheduler for the Claremont Colleges. Currently live at [https://hyperschedule.io/](https://hyperschedule.io/).
![](docs/demo.gif)

## Getting Started

To clone this repository, you'll need Git LFS installed first since this repository uses LFS for large data files:

```shell
# Install Git LFS if you haven't already
git lfs install

# Clone the repository
git clone https://github.com/hyperschedule/hyperschedule.git
cd hyperschedule
```

## Basic Dependencies

To run the code, you need to have at least one of these installed on your computer:

- [Node.js 26.12.1 or newer in the 26.x release line](https://nodejs.org/en) and [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/) (and if necessary, Docker Desktop)

The Node.js version in `.node-version` and `base.dockerfile` includes the
[October 2026 security fixes](https://nodejs.org/en/blog/release/v26.12.1/), including
the Brotli decoder RCE fix (CVE-2026-111497). If your operating system supplies a
Node.js build linked to a separate Brotli library, ensure that library also
includes the fix; the official Node.js binary and Docker image bundle the patched
decoder. Rebuild containers with `docker compose build --pull` after runtime updates.

The application and development container use the official Node.js Debian image.
Container dependencies stay in named volumes separate from host dependencies.
The glibc runtime also supports the in-memory MongoDB binaries used by the test suite.
Compose uses the official MongoDB 7.0 image and published Docker tools; we do not
rebuild MongoDB utilities, Docker Compose, or system libraries from source.

Run `pnpm ci:audit` to check all workspace dependencies, including development
dependencies, against the current advisory database. CI enforces this audit and
runs the existing tests, typechecks, lint, formatting, and production build.
Image scans retain complete reports for review, including remaining vendor CVEs;
their vulnerability counts are informational. Image build, scan execution, and
development-runtime checks still fail CI on errors. Automatic frontend deployment
uses the commit that passed the checks. See [the update and rollout notes](docs/dependency-upgrade.md)
for scope, limitations, and deployment precautions.

## If you use Windows

Please install both `pnpm` and `node` inside WSL2. Choose Debian Bullseyes if you aren't sure which distro to use,
but other distros should be fine

## If you use macOS

1. The `bash` that came with your macOS is likely still on version 3.2 (if you aren't sure, run `bash --version`), which
   was released back in 2006. Please download a slightly more modern bash (as of Nov 2023, the latest version is 5.2.21).

## Docker Compose Stack

**Services:**

- Frontend (port 3000)
- Backend (port 8080)
- Database (mongoDB)
- Web Server (nginx, port 80, only needed for SAML flow)

**First time setup:**

At project root, run `pnpm install`. Then, run `docker compose build`. Lastly, run `pnpm docker` then `pnpm docker-load-db` to load
test data.

**After:**

Every time you restart your computer or Docker desktop, you need to run `pnpm docker` again to start the stack.
Then go to `http://localhost:3000` in your browser.

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

Not a fan of Docker or dev containers? Good news, you don't have to use either. At project root, run `pnpm install` to
install all the JavaScript dependencies.

Then, you need to install [MongoDB 7.0.45 or a later patched 7.0 release](https://www.mongodb.com/docs/manual/installation/) and set it up according to your OS. Make sure it's listening to port `27017` with username `hyperschedule` and password `local_dev`. Alternatively, you can set it up some
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

Then, install [nginx 1.30.6 or a later patched stable release](https://nginx.org/en/download.html) on your computer.
If you are not running Linux, you might have to compile nginx from the source. You can find
the nginx configuration file and the self-signed certificate we use at the [data/nginx](./data/nginx)
folder.

Lastly, run `pnpm frontend` and `pnpm backend` in two different terminals to start everything.
