const prefix = process.env.FETCHER_PREFIX;
if (prefix === undefined) {
    throw Error("FETCHER_PREFIX environment variable undefined");
}
import { connectToDb } from "./db";
import { DB_URL } from "./db/credentials";
import { runScheduler } from "./hmc-api/fetcher/scheduler";

await connectToDb(DB_URL);
await runScheduler(prefix);
