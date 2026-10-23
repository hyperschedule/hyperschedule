# Dependency update and rollout

This PR updates application dependencies and requires the official Node.js
26.12.1 runtime with pnpm 10.34.8. Node's [security release](https://nodejs.org/en/blog/release/v26.12.1/)
includes the CVE-2026-111497 Brotli decoder fix. System-provided Node builds that
link system Brotli need a patched system library too.

## Scope and vulnerability reporting

- Application dependencies, including SAML/XML, HTTP, MongoDB client, frontend,
  and build/test tools, are updated. The workspace audit includes development
  dependencies and blocks CI on known advisories.
- The application and development container use the official Node Debian image.
  The development container installs ordinary distro updates and uses published
  Docker CLI/plugins. nginx uses its official image with an ordinary Alpine
  package update. No Go tools or C/C++ libraries are compiled or patched here.
- Compose uses the official `mongo:7.0.45` image. There is no modified MongoDB
  server, entrypoint, Database Tools, gosu, or js-yaml packaging.
- Vendor images still contain reported vulnerabilities, including high/critical
  package findings. Image scans retain every severity, including unfixed findings,
  without ignores. Their counts are informational; build failures, scanner errors,
  and development-runtime test failures remain blocking.
- A scanner's package severity does not by itself establish application exposure.
  Some findings affect command-line tools or compiled-in modules. Review the full
  reports and upstream fixes; this PR does not classify all vendor findings as
  unreachable or claim the complete stack has no CVEs.
- The small `thread-stream` patch only fixes TypeScript declarations for Node 26;
  it does not change executable behavior or vendor security logic.

## Validation

The existing 65 tests, frozen installation, full/production dependency audits,
workspace typechecks, lint, formatting, and frontend production build are checked.
CI also runs the existing tests, typechecks, build, and shell/tool startup inside
its development image. No new regression-test files are added.

Additional isolated checks covered application upgrade and rollback with shared
MongoDB storage (236 assertions across 122 HTTP requests), existing/new JWTs,
stored member JSON, schedule mutations, ordering, history, calendar export,
CORS/authentication rejection, actual old browser persistence, and signed SAML
assertions. Live public catalog responses validated against the new schemas.
Those application checks remain relevant because the application code is unchanged
by the container simplification. Compose startup, authenticated dump/restore and
volume persistence, and the development runtime are checked with the official
images as well. Runtime checks are on Linux amd64; arm64 has not been exercised.

Live school SSO and the actual devserver service/proxy configuration remain
unverified because read-only SSH was rejected with both available keys. One
pre-existing issue was reproduced on both application versions: calendar export
can return 500 for schedule names containing non-Latin-1 characters. Unicode
schedule storage itself works.

## Before updating the devserver

The likely host is `srv.banana.hyperschedule.io`; its deployment configuration is
not in this repository. Do not assume the local development Compose file describes
that server.

1. Record the current release, launch commands, runtime, proxy targets, MongoDB
   version, volumes, and permissions. Retain the release and dependencies for rollback.
2. Preserve server-local JWT signing keys in `backend/src/auth/keys.ts`, private
   HMC endpoint/auth configuration in `backend/src/hmc-api/fetcher/endpoints.ts`,
   environment files, DB_URL, PROCESS_NAME, FETCHER_PREFIX, and data/log permissions.
   These source files may be marked skip-worktree. Keep existing signing keys so
   current sessions survive.
3. Take an authenticated, consistent database backup and restore it into an
   isolated database to verify it. Keep MongoDB on its existing server major version.
4. Prepare a separate release checkout with that private configuration. Install
   the pinned Node/pnpm before checkout/merge hooks, which run pnpm install.
   Run frozen installation and the normal checks. Services with hardcoded ts-node
   loaders need the new tsx command from the backend package scripts. Verify any
   frontend development proxy against the port change from 5000 to 3000.
5. Stage the backend against the restored backup, mapping fixed container port
   8080 to an unused host loopback port. Check an existing session, schedule writes,
   refresh, export, actual school login, HTTPS, cookies/CORS, callback URLs, and logs.
   Keep only one production fetcher active; stop the old one before starting its replacement.
6. Switch only after readiness and login checks pass. If they fail, stop the new
   processes and restore the previous release/configuration. Keep the backup and
   verify only one fetcher is running. Never delete database volumes during rollout.

Compose keeps workspace dependency volumes separate from host dependencies and
replaces old pnpm module layouts without an interactive prompt. Its readiness
checks wait for authenticated MongoDB and working backend/frontend responses.
These checks reduce avoidable failures but do not establish a numerical deployment
failure probability; the live configuration and identity provider require staging.
