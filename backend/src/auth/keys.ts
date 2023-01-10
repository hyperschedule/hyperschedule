import { readFile } from "fs/promises";
import * as process from "process";

/*
To generate new keys, run

openssl ecparam -name secp521r1 -genkey -noout -out dev-privkey.pem
openssl ec -in dev-privkey.pem -pubout > dev-pubkey.pem 
 */

let PUBKEY: string, PRIVKEY: string;

if (process.env.NODE_ENV === "production") {
    let pub = process.env.PUBKEY;
    let priv = process.env.PRIVKEY;

    if (pub === undefined)
        throw Error("Environment variable PUBKEY is not defined");
    if (priv === undefined)
        throw Error("Environment variable PRIVKEY is not defined");

    PUBKEY = pub;
    PRIVKEY = priv;
} else {
    PRIVKEY = await readFile(new URL("dev-privkey.pem", import.meta.url), {
        encoding: "utf-8",
    });
    PUBKEY = await readFile(new URL("dev-pubkey.pem", import.meta.url), {
        encoding: "utf-8",
    });
}

export { PUBKEY, PRIVKEY };
