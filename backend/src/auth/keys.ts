/**
 * Similar to endpoints.ts, this file is left out of version control using
 * ```
 * git update-index --skip-worktree src/auth/keys.ts
 * ```
 *
 * Why not environment variables? Because keys are multi-line and handling of multiline env vars are really
 * inconsistent across OSes and packages.
 */

export { PUBKEY, PRIVKEY } from "./dev-keys";
