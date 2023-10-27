/**
 * This file is used to download all historical data
 */

import { fetchAllForTerm, loadAllForTerm } from "./hmc-api/fetcher/fetch";

const prefix = process.env.FETCHER_PREFIX;
if (prefix === undefined) {
    throw Error("FETCHER_PREFIX environment variable undefined");
}

import { DB_URL } from "./db/credentials";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { connectToDb, closeDb } from "./db/connector";
import { updateSections } from "./db/models/course";
import { linkCourseData } from "./hmc-api/data-linker";
import { termIsBefore } from "hyperschedule-shared/api/v4";

await connectToDb(DB_URL);
for (let year = 2011; year <= CURRENT_TERM.year; year++) {
    for (const term of [APIv4.Term.fall, APIv4.Term.spring]) {
        const termId: APIv4.TermIdentifier = { term, year };
        if (!termIsBefore(termId, CURRENT_TERM))
            // this should not be used to fetch current term data
            break;
        await fetchAllForTerm(prefix, termId);
        const files = await loadAllForTerm(termId);
        const sections = linkCourseData(files, termId);
        await updateSections(sections, termId);
    }
}

await closeDb();
