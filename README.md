**Hyperschedule**: webapp for scheduling Claremont Colleges courses
quickly.

## Live demo

Check out <https://hyperschedule.io>!

## See also

This repository contains only the HTML, CSS, and TypeScript comprising
the front-end webapp hosted on Netlify. The backend, which serves a
single-endpoint JSON API and handles scraping information from the
Claremont Colleges course catalog, is located [here][scraper].

## Local development

Clone this repository on your local machine by running 

    $ git clone https://github.com/MuddCreates/hyperschedule.git
 
Then run,

    $ npm run setup

to install all of the project dependencies and set up git pre-commit hooks. 
At this point you can run the webapp locally by running

    $ npm run dev

This will build the static files and serve them to `localhost:5000`.
By default, the webapp expects the API to be running at
`https://hyperschedule.herokuapp.com`. If you're doing development on
the API locally, you'll want to override this by passing e.g.
`API_URL=http://localhost:3000` (or similar). If exporting to
`localhost`, don't forget the `http`, since otherwise Chrome's CORS
policy will block the request.

Other npm commands available:
      npm run               Show list of commands available
      npm run dev           Start development server
      npm run build         Compile TypeScript for production
      npm run setup         Install dependencies and Git pre-commit hooks
      npm run setup-hooks   Install Git pre-commit hooks
      npm run clean         Remove files ignored by Git
      npm run clean-all     Remove all files, even in untracked directories
      npm run format        Auto-format TypeScript
      npm run lint          Verify all code is formatted
      npm run ci            Run tests that CI will run

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
