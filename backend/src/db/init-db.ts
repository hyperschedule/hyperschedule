import * as APIv4 from "hyperschedule-shared/api/v4";
import { readFile } from "fs/promises";
import { DB_URL } from "./credentials";
import { closeDb, connectToDb } from "./connector";
import { createLogger } from "@/logger";
import { updateSections } from "./models/course";

const logger = createLogger("db.init");

logger.info("Connecting to db...");
await connectToDb(DB_URL);
logger.info("db connected");

const data = JSON.parse(
    await readFile("src/hmc-api/sample/parsed-sample-v4.json", {
        encoding: "utf-8",
    }),
) as APIv4.Section[];

console.log("Sample data loaded");

await updateSections(data, { year: 2022, term: APIv4.Term.spring });

await closeDb();
