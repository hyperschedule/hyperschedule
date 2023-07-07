import { createLogger } from "../logger";
import * as APIv4 from "hyperschedule-shared/api/v4";

// we use lazy import here to make sure createRootLogger can be executed first
import { connectToDb, closeDb } from "./connector";
import { DB_URL } from "./credentials";
import { updateSections } from "./models/course";
import { loadAllForTerm } from "../hmc-api/fetcher/fetch";
import { linkCourseData } from "../hmc-api/data-linker";

const logger = createLogger("db.init");

logger.info("Connecting to db...");
await connectToDb(DB_URL);
logger.info("db connected");

const term = { term: APIv4.Term.spring, year: 2022 };
const data = linkCourseData(await loadAllForTerm(term), term);

logger.info("Sample data loaded");

await updateSections(data, { year: 2022, term: APIv4.Term.spring });

await closeDb();
