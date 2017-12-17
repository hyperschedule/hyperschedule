**Hyperschedule**: Webapp for scheduling 5C courses quickly.

## Live demo

Check out https://hyperschedule.io!

## See also

As we all know, microservices [are the future][its-the-future]. We
have three of 'em: the front-end webapp (this repository),
the [course catalog API][api], and the [Portal scraper][scraper].

(Well, technically the course catalog and the Portal scraper are still
one service. They will be separated once the [new API][new-api] is up
and running.)

## Local development
### Install dependencies
#### macOS

Install [Homebrew]:

    $ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Install [Yarn]:

    $ brew install yarn

### Set up project

Install Node.js dependencies:

    $ yarn

### Run locally

Build the static files and serve them to `localhost:5000` (use a
different port by exporting `PORT`):

    $ yarn dev

By default, the webapp expects the API to be running at
`https://hyperschedule.herokuapp.com`. If you're doing development on
the API locally, you'll want to override this by exporting `API_URL`
to `http://localhost:3000` (or similar). If exporting to `localhost`,
don't forget the `http`, since otherwise Chrome's CORS policy will
block the request.

### Deploy

Deployment happens automatically when a commit is merged to `master`.

[api]: https://github.com/MuddCreates/hyperschedule-scraper
[homebrew]: https://brew.sh/
[its-the-future]: https://circleci.com/blog/its-the-future/
[new-api]: https://github.com/MuddCreates/hyperschedule-api
[scraper]: https://github.com/MuddCreates/hyperschedule-scraper
[yarn]: https://yarnpkg.com/en/
