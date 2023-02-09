import { describe, test, expect } from "@jest/globals";
import { signUser, verifyUser } from "../src/auth/token";
import { PUBKEY } from "../src/auth/keys";
import jwt from "jsonwebtoken";
import { v4 as uuid4 } from "uuid";

describe("auth/token.ts", () => {
    test("User encoding and decoding works correctly", () => {
        const uuid = uuid4();
        const sig = signUser({ uuid });
        expect(verifyUser(sig).uuid).toStrictEqual(uuid);
    });
    test("Token expiration works correctly", () => {
        let uuid = uuid4();
        let sig = signUser({
            uuid,
            // @ts-ignore forcing an iat to backdate this by a year
            iat: Math.floor(new Date().getTime() / 1000) - 365 * 24 * 60 * 60,
        });
        expect(() => verifyUser(sig)).toThrowError();

        sig = signUser({
            uuid,
            // @ts-ignore forcing an iat to backdate this by a year
            iat: Math.floor(new Date().getTime() / 1000) - 364 * 24 * 60 * 60,
        });
        expect(verifyUser(sig).uuid).toStrictEqual(uuid);
    });
    test("Signature verification works correctly", () => {
        const uuid = uuid4();
        const sig = signUser({
            uuid,
        });
        expect(() =>
            verifyUser(sig.slice(0, sig.length - 4) + "AAAA"),
        ).toThrowError();
    });

    test("Signature algorithm cannot be modified", () => {
        // there's this funny thing called algorithm confusion attack on JWT
        // and this test is to make sure the code is resilient to the attack
        // ref: https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/

        const uuid = uuid4();
        let p1 = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
            .toString("base64")
            .replaceAll("=", "");

        let p2 = Buffer.from(
            JSON.stringify({
                uuid,
                iat: Math.floor(new Date().getTime() / 1000),
            }),
        )
            .toString("base64")
            .replaceAll("=", "");
        let sig = `${p1}.${p2}.AAAA`;

        expect(() => verifyUser(sig)).toThrowError();

        sig = jwt.sign({ uuid }, PUBKEY, { algorithm: "HS256" });
        expect(() => verifyUser(sig)).toThrowError();
    });
});
