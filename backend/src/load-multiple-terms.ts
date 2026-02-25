/**
 * This file is used to load data for multiple semesters for test data generation
 */

import { loadAllForTerm } from "./hmc-api/fetcher/fetch";
import { createLogger } from "./logger";

const logger = createLogger("fetch-all");

import { DB_URL } from "./db/credentials";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { connectToDb, closeDb } from "./db/connector";
import { updateSections } from "./db/models/course";
import { linkCourseData } from "./hmc-api/data-linker";
import { Term } from "hyperschedule-shared/api/v4";

// Define an array of terms to load data for
const TERMS_TO_LOAD: readonly APIv4.TermIdentifier[] = [
    {
        year: 2026,
        term: Term.fall,
    },
    {
        year: 2026,
        term: Term.spring,
    },
    // Add more terms as needed
    // {
    //   year: 2024,
    //   term: Term.fall,
    // },
];

async function loadMultipleTerms(): Promise<void> {
    await connectToDb(DB_URL);
    logger.info("Connected to DB");

    for (const term of TERMS_TO_LOAD) {
        try {
            logger.info(
                `Loading data for ${APIv4.stringifyTermIdentifier(term)}`,
            );

            const files = await loadAllForTerm(term);
            const sections = linkCourseData(files, term);
            await updateSections(sections, term);

            logger.info(
                `Successfully updated data for ${APIv4.stringifyTermIdentifier(
                    term,
                )}`,
            );
        } catch (error) {
            logger.error(
                `Error loading data for ${APIv4.stringifyTermIdentifier(
                    term,
                )}: ${error}`,
            );
        }
    }

    await closeDb();
    logger.info("Database connection closed");
}

// Execute the function
loadMultipleTerms().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
});
