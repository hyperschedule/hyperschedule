/*
To generate new keys, run

openssl ecparam -name secp521r1 -genkey -noout -out privkey.pem
openssl ec -in dev-privkey.pem -pubout > pubkey.pem
 */
import { loadDataFile } from "hyperschedule-data";

const PUBKEY = await loadDataFile("keys", "dev-pubkey.pem");
const PRIVKEY = await loadDataFile("keys", "dev-privkey.pem");
export { PUBKEY, PRIVKEY };
