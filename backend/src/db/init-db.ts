import * as APIv4 from "hyperschedule-shared/api/v4";
import { DB_URL } from "./credentials";
import { closeDb, connectToDb } from "./connector";
import { createLogger } from "../logger";
import { updateSections } from "./models/course";
import { loadDataFile } from "hyperschedule-data";

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
