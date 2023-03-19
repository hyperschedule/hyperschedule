import { runScheduler } from "./hmc-api/fetcher/scheduler";
import { connectToDb } from "./db";
import { DB_URL } from "./db/credentials";

await connectToDb(DB_URL);
await runScheduler();
