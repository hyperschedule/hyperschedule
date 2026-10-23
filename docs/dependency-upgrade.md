# Dependency security update and rollout

This update requires Node.js 26.12.1 and pnpm 10.34.8. Node's official
[security release](https://nodejs.org/en/blog/release/v26.12.1/) includes the
CVE-2026-111497 Brotli decoder fix. An operating-system Node build linked to
system Brotli also needs a patched system library. The development image replaces
Ubuntu's separate Brotli library with upstream 1.2.1; changing Node alone would
leave that library vulnerable.

## Container changes and scan scope

- The application base uses Alpine and the official patched Node binary.
- MongoDB remains **7.0.45**, with the original server binary, mongosh, entrypoint,
  libraries, and database user/group. Only gosu, Database Tools, and the entrypoint's
  js-yaml helper change. Go helpers are rebuilt from checksum-verified source with
  Go 1.27.3 and fixed dependencies. Database Tools retain GSSAPI support and PIE.
- The development image uses Ubuntu 26.04 LTS with glibc for MongoMemoryServer.
  Docker is a client of the host engine; the image includes a patched Compose
  build and no nested daemon or Buildx plugin. Ordinary builds were checked against
  the host Podman API. BuildKit-only workflows need a separately maintained builder.
- nginx uses the patched stable release and updated Alpine packages.

On 2026-10-23, Trivy found **zero high/critical CVEs in all four built images**,
with unfixed findings included and no vulnerability ignores. The complete MongoDB
report still contains 34 medium and 16 low package occurrences; the development
image contains 50 medium and 4 low. These reports do not establish that an image
has no vulnerabilities. Counts differ between scanners and change with advisory
databases. CI builds all four images, saves reports for every severity, and fails
on any high/critical result, including one without an available fix.

The Go module reports also retain an unknown-severity
[OpenPGP advisory](https://pkg.go.dev/vuln/GO-2026-5932). MongoDB helper binary
analysis with govulncheck found no vulnerable imported packages/symbols, and their
symbol tables contain no OpenPGP code. Module presence alone does not establish
that a vulnerable package is linked. No suppression or VEX exemption is applied.

Repository secret scanning identifies the intentionally public, development-only
JWT and localhost TLS keys in `data/keys` and `data/nginx/cert`. Production requires
separate keys. Container root-user warnings are configuration findings, separate
from the package CVE counts; MongoDB's entrypoint drops privileges for its server.

## Correctness checks

The existing 65 tests pass with the new dependencies and runtime, including a
backend run against MongoDB 7.0.45. Frozen installation, audit, typecheck, lint,
formatting, and production build pass. The same tests, typechecks, installation,
audit, and production build also pass inside the glibc development image. CI
repeats the existing tests, typecheck, build, and shell/tool startup in that image.
Runtime/image checks were performed on Linux amd64; arm64 was not exercised.

Additional isolated checks covered:

- An old application and frozen lockfile on Node 18, the upgraded application on
  Node 26, and rollback to the old application and original MongoDB image against
  the same database volume: **236 assertions across 122 HTTP requests**.
- Existing and newly issued JWTs accepted across upgrade and rollback; existing
  member JSON preserved; schedule mutations, ordering, history, calendar exports,
  CORS, and authentication rejection checked through HTTP.
- Actual old Zustand persistence serialized by the original application and
  restored in the new browser build; scheduling, preferences, refresh, and guest
  and member views checked without browser warnings/errors.
- Signed offline SAML assertions accepted; tampering, unsigned-only assertions,
  and wrong audiences rejected. Responses containing unsigned decoys selected
  only the genuine signed identity. This does not replace a live school
  identity-provider login after staging.
- MongoDB authentication, original-volume reuse, restart, gzip dump/restore with
  indexes and Unicode data, trusted TLS acceptance and untrusted TLS rejection.
- Compose startup with dependency volumes populated by the old frozen lockfile:
  the noninteractive install replaces old pnpm/driver/Zod dependencies, and all
  4,249 restored sections and exact member JSON survive the upgrade and restart.
- Live public API responses: 2,192 sections, 32 terms, and the current term all
  validate against the upgraded schemas.

No new regression-test files are included. One pre-existing issue was reproduced
on both versions: calendar export can return 500 when the schedule name contains
characters outside Latin-1, such as Greek delta. Unicode schedule storage itself
works. This is separate from the dependency changes.

## Development container

Build from the repository root, in order:

```sh
docker build --file base.dockerfile --tag hyperschedule-dev-base .
docker build --file dev-container.dockerfile --tag hyperschedule-devcontainer .
docker run --rm -it hyperschedule-devcontainer /bin/zsh
```

The image contains a disposable checkout. In that shell, run `pnpm install
--frozen-lockfile` and then `pnpm ci:test`, `pnpm ci:typecheck`, or `pnpm ci:build`.
To use the host engine from inside the image, mount its socket and set DOCKER_HOST.
For rootless Podman on Linux:

```sh
podman run --rm -it \
  -e DOCKER_HOST=unix:///var/run/docker.sock \
  -v "$XDG_RUNTIME_DIR/podman/podman.sock:/var/run/docker.sock" \
  hyperschedule-devcontainer /bin/zsh
```

If binding the host checkout for persistent edits, give the development container
its own root and workspace `node_modules` volumes; glibc and Alpine dependencies
must not share those volumes. The existing `pnpm docker-dev` script references an
absent `.devcontainer/docker-compose.yml`; the commands above are the validated
path. Normal `pnpm docker` uses the main Compose stack, whose readiness checks
wait for authenticated MongoDB, backend API, and frontend responses. The default
frontend API remains `http://localhost:8080`, including for bare pnpm startup.

## Devserver rollout and rollback

The likely host is `srv.banana.hyperschedule.io`. Its service manager, launch
commands, environment, proxy, and database location have **not** been inspected:
read-only SSH was rejected with both available keys. The repository does not
provide its deployment configuration. Do not infer a production launch command
from the local development Compose file.

1. Record the currently running commit, runtime, service commands, proxy targets,
   MongoDB version, and volume/path ownership. Preserve the current release and
   its dependencies for rollback.
2. Preserve server-local configuration outside Git: the production JWT key pair
   in `backend/src/auth/keys.ts`, HMC endpoint/auth configuration in
   `backend/src/hmc-api/fetcher/endpoints.ts`, environment files, DB_URL,
   PROCESS_NAME, FETCHER_PREFIX, database files, and log/data permissions.
   Those source files may be marked skip-worktree. Do not rotate signing keys as
   part of this update; doing so invalidates existing sessions.
3. Take a database backup using the existing authenticated/TLS connection settings
   and restore it into an isolated database to prove it is usable. Copying live
   WiredTiger files is not a substitute for a consistent backup.
4. Prepare a separate release checkout with the existing private configuration.
   Install the pinned Node/pnpm **before** invoking checkout/merge hooks: both
   hooks run pnpm install, and engine-strict rejects an old runtime. Prefer
   preparing the new checkout over pulling directly into the running release.
5. Run frozen installation, existing tests, typecheck, audit, production build,
   and image scans for the exact release. Retain the built images for rollback.
   If the service hardcodes ts-node loader arguments, update it to the new tsx
   command used by the backend package scripts. Confirm the frontend's development
   port change from 5000 to 3000 against the actual proxy configuration.
6. Stage the new backend against the restored backup, mapping its fixed container
   port 8080 to an unused host loopback port (or using a separate network namespace).
   Do not run a second production fetcher: it writes catalog/scheduler state.
   Validate API catalog and history, an existing session, schedule editing and
   export, browser persistence, and a real school login through the actual proxy.
   Check cookie/CORS, callback URLs, HTTPS, and logs.
7. Stop the old fetcher before starting its replacement. Switch the backend/proxy
   only after readiness succeeds, then check the same flows and logs immediately.
   Keep MongoDB on its existing server major version; this update needs no schema
   migration. Never use `docker compose down --volumes` during this rollout.
8. If readiness, login, or schedule persistence fails, stop the new processes and
   switch to the retained previous release/configuration. The isolated rehearsal
   confirmed old application and MongoDB binaries can reopen candidate-written
   data, but preserve the backup for unexpected state differences. Ensure only
   one fetcher is active after rollback.

The covered application paths and database rollback passed. A numerical chance
of deployment failure would be unsupported: actual server configuration and a
live identity-provider round trip remain the material unknowns. Resolve those
with staging before the service switch.
