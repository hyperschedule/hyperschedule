/**
 * Authentication signing keys for JWT tokens.
 *
 * In production, keys are loaded from disk via AUTH_KEYS_PATH (containing
 * pubkey.pem and privkey.pem), mounted into the container via Docker secrets.
 * In development (NODE_ENV !== "production"), this falls back to local dev-keys.
 *
 * We load keys from disk rather than environment variables because multi-line
 * PEM handling is inconsistent across shells and environments, and to avoid
 * modifying git-tracked files on the host with `git update-index --skip-worktree`.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PUBKEY as devPub, PRIVKEY as devPriv } from "./dev-keys";

let pub: string, priv: string;

const keysPath = process.env.AUTH_KEYS_PATH;

if (
    keysPath &&
    existsSync(join(keysPath, "pubkey.pem")) &&
    existsSync(join(keysPath, "privkey.pem"))
) {
    pub = readFileSync(join(keysPath, "pubkey.pem"), "utf-8").trim();
    priv = readFileSync(join(keysPath, "privkey.pem"), "utf-8").trim();
} else if (process.env.NODE_ENV !== "production") {
    pub = devPub.trim();
    priv = devPriv.trim();
} else {
    pub = "";
    priv = "";
    throw Error(
        "PUBKEY and PRIVKEY are not set. In production, provide an AUTH_KEYS_PATH directory containing pubkey.pem and privkey.pem.",
    );
}

export { pub as PUBKEY, priv as PRIVKEY };
