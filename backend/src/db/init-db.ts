import { createLogger, createRootLogger } from "../logger";
import * as APIv4 from "hyperschedule-shared/api/v4";

createRootLogger("init-db");

// we use lazy import here to make sure createRootLogger can be executed first
const { connectToDb, closeDb } = await import("../db/connector");
const { DB_URL } = await import("../db/credentials");
const { updateSections } = await import("./models/course");
const { loadAllForTerm } = await import("../hmc-api/fetcher/fetch");
const { linkCourseData } = await import("../hmc-api/data-linker");

const logger = createLogger("db.init");

logger.info("Connecting to db...");
await connectToDb(DB_URL);
logger.info("db connected");

const term = { term: APIv4.Term.spring, year: 2022 };
const data = linkCourseData(await loadAllForTerm(term), term);

logger.info("Sample data loaded");

await updateSections(data, { year: 2022, term: APIv4.Term.spring });

await closeDb();
