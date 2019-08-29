**Hyperschedule**: webapp for scheduling Claremont Colleges courses
quickly.

## Live demo

Check out <https://hyperschedule.io>!

## See also

This repository contains only the HTML, CSS, and JavaScript comprising
the front-end webapp hosted on Netlify. The backend, which serves a
single-endpoint JSON API and handles scraping information from the
Claremont Colleges course catalog, is located [here][scraper].

## Local development

Install [Docker]. Then, run

    $ make docker

to start a shell with all of the project dependencies already
installed. At this point you can run the webapp locally by running

    $ make dev

This will build the static files and serve them to `localhost:5000`;
to use a different port, just pass e.g. `PORT=5001` as an argument to
`make dev`. By default, the webapp expects the API to be running at
`https://hyperschedule.herokuapp.com`. If you're doing development on
the API locally, you'll want to override this by passing e.g.
`API_URL=http://localhost:3000` (or similar). If exporting to
`localhost`, don't forget the `http`, since otherwise Chrome's CORS
policy will block the request.

Other Makefile targets are available:

    $ usage:
      make clean   Remove build artifacts
      make hooks   Install Git hooks
      make build   Compile JavaScript for production
      make dev     Start development server and automatically recompile JavaScript
      make docker  Start shell or run command (e.g. make docker CMD="make dev")
      make format  Auto-format JavaScript
      make lint    Verify that all code is correctly formatted
      make ci      Run tests that CI will run
      make help    Show this message

### Deploy

Deployment to Netlify happens automatically when a commit is merged to
`master`. If you have permission to manage the deployment pipeline,
the administrator dashboard is [here][netlify].

## Vendored code

The file `src/js/vendor/ics-0.2.0.min.js` was obtained by copying [the
file `ics.deps.min.js` from the repository
https://github.com/nwcell/ics.js at tag
0.2.0](https://github.com/nwcell/ics.js/blob/0.2.0/ics.deps.min.js)
and replacing the string `rrule` with `RRULE` in one place to work
around [an issue](https://github.com/nwcell/ics.js/issues/51) and
replacing `var ics=` with `module.exports = ` to work around another
issue where Parcel changes global variable names of included scripts.
Is it horrifying? Yes. But does it work? Yes.

[docker]: https://www.docker.com/
[heroku]: https://dashboard.heroku.com/apps/hyperschedule
[netlify]: https://app.netlify.com/sites/hyperschedule/overview
[scraper]: https://github.com/MuddCreates/hyperschedule-scraper
