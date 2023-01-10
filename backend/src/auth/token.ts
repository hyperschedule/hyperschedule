import jwt from "jsonwebtoken";
import { PRIVKEY, PUBKEY } from "./keys";
import { validate } from "uuid";

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

export function verifyUser(s: string): UserToken {
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
        throw Error("Invalid token header");

    if (typeof payload === "string") throw Error("Invalid payload");
    if (
        payload.iat === undefined ||
        payload.exp === undefined ||
        !validate(payload.uuid) ||
        Object.keys(payload).length !== 3
    )
        throw Error("Invalid payload");

    return { uuid: payload.uuid as string };
}
