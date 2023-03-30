import { createRootLogger } from "./logger";

createRootLogger("fetcher");

// we use lazy import here to make sure createRootLogger is executed first
const { connectToDb } = await import("./db");
const { DB_URL } = await import("./db/credentials");
const { runScheduler } = await import("./hmc-api/fetcher/scheduler");

await connectToDb(DB_URL);
await runScheduler();
