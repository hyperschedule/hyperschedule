import { createRootLogger, createLogger } from "../logger";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { loadDataFile } from "hyperschedule-data";

createRootLogger("init-db");

// we use lazy import here to make sure createRootLogger can be executed first
const { connectToDb, closeDb } = await import("../db/connector");
const { DB_URL } = await import("../db/credentials");
const { updateSections } = await import("./models/course");

const logger = createLogger("db.init");

logger.info("Connecting to db...");
await connectToDb(DB_URL);
logger.info("db connected");

const data = APIv4.Section.strict()
    .array()
    .parse(JSON.parse(await loadDataFile(".", "parsed-sample-v4.json")));

logger.info("Sample data loaded");

await updateSections(data, { year: 2022, term: APIv4.Term.spring });

await closeDb();
