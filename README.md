**Hyperschedule**: webapp for scheduling 5C courses quickly.

## Live demo

Check out https://hyperschedule.io!

## See also

This repository contains only the HTML, CSS, and JavaScript comprising
the front-end webapp hosted on Netlify. The backend, which serves a
single-endpoint JSON API and handles scraping information from the
Claremont Colleges course catalog, is located [here][scraper].

## Local development

Install [Yarn]. Then, install the NPM dependencies by running `yarn`
in the project root. You are ready to run the webapp locally:

    $ yarn dev

This will build the static files and serve them to `localhost:5000`;
to use a different port, just export `PORT`. By default, the webapp
expects the API to be running at
`https://hyperschedule.herokuapp.com`. If you're doing development on
the API locally, you'll want to override this by exporting `API_URL`
to `http://localhost:3000` (or similar). If exporting to `localhost`,
don't forget the `http`, since otherwise Chrome's CORS policy will
block the request.

There are a few other Yarn tasks available, each runnable with `yarn
<task>`. The `dev` task actually just runs `server` and `watch` in
parallel. The `server` task serves the built static files, while
`watch` compiles those files and recompiles when there is a change to
the source. You can build just once with the `build` task, and remove
the built files with the `clean` task.

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
around [an issue](https://github.com/nwcell/ics.js/issues/51). Is it
horrifying? Yes. But does it work? Yes.

[heroku]: https://dashboard.heroku.com/apps/hyperschedule
[netlify]: https://app.netlify.com/sites/hyperschedule/overview
[scraper]: https://github.com/MuddCreates/hyperschedule-scraper
[yarn]: https://yarnpkg.com/en/
