/**
 * Similar to endpoints.ts, this file is left out of version control using
 * ```
 * git update-index --skip-worktree src/auth/keys.ts
 * ```
 *
 * Why not environment variables? Because keys are multi-line and handling of multiline env vars are really
 * inconsistent across OSes and packages.
 */

import { PUBKEY as devPub, PRIVKEY as devPriv } from "./dev-keys";

let pub: string, priv: string;

if (process.env.NODE_ENV !== "production") {
    pub = devPub;
    priv = devPriv;
} else {
    pub = "";
    priv = "";
    throw Error("PUBKEY and PRIVKEY are not set in keys.ts");
}

export { pub as PUBKEY, priv as PRIVKEY };
