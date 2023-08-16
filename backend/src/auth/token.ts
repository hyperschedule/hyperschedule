import jwt from "jsonwebtoken";
import { PRIVKEY, PUBKEY } from "./keys";

export interface UserToken {
    uuid: string;
}

const SIGNING_ALGORITHM = "ES512";
const TOKEN_VALIDITY = "365d";

export function signUser(uuid: UserToken) {
    return jwt.sign(uuid, PRIVKEY, {
        algorithm: SIGNING_ALGORITHM,
        expiresIn: TOKEN_VALIDITY,
    });
}

export function safeVerifyUser(
    s: string,
): { valid: false; reason: string } | { valid: true; token: UserToken } {
    try {
        const { header, payload } = jwt.verify(s, PUBKEY, {
            algorithms: [SIGNING_ALGORITHM],
            maxAge: TOKEN_VALIDITY,
            complete: true,
        });

        if (
            header.alg !== SIGNING_ALGORITHM ||
            header.typ !== "JWT" ||
            Object.keys(header).length !== 2
        )
            return { valid: false, reason: "invalid token header" };

        if (typeof payload === "string")
            return { valid: false, reason: "invalid payload" };
        if (
            payload.iat === undefined ||
            payload.exp === undefined ||
            Object.keys(payload).length !== 3
        )
            return { valid: false, reason: "invalid payload" };

        return { valid: true, token: { uuid: payload.uuid as string } };
    } catch (e: any) {
        return { valid: false, reason: e.message };
    }
}

export function verifyUser(s: string): UserToken {
    const res = safeVerifyUser(s);
    if (res.valid) return res.token;
    throw Error(res.reason);
}
