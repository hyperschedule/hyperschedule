import { createLogger } from "../logger";
import { connectToDb, closeDb } from "./connector";
import { DB_URL } from "./credentials";
import { updateSections } from "./models/course";
import { loadAllForTerm } from "../hmc-api/fetcher/fetch";
import { linkCourseData } from "../hmc-api/data-linker";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import * as APIv4 from "hyperschedule-shared/api/v4";

const logger = createLogger("db.init");

logger.info("Connecting to db...");
await connectToDb(DB_URL);
logger.info("db connected");

//const term = { term: APIv4.Term.spring, year: 2022 };
for (let year = 2011; year <= CURRENT_TERM.year; year++) {
    for (const term of [
        { year, term: APIv4.Term.spring },
        { year, term: APIv4.Term.fall },
    ]) {
        loadAllForTerm(term)
            .then((files) => {
                const data = linkCourseData(files, term);
                return updateSections(data, term);
            })
            .catch(() =>
                logger.info(
                    "Cannot load data files for %s",
                    APIv4.stringifyTermIdentifier(term),
                ),
            );
    }
}

logger.info("All data loaded");

await closeDb();
