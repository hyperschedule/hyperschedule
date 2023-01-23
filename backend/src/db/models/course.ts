import { collections } from "../collections";
import type { DBSection } from "../collections";
import { dbToSection, sectionToDb } from "../utils";
import type * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";
import type { TermIdentifier } from "hyperschedule-shared/api/v4";

const logger = createLogger("db.course");

/**
 * Replaces the existing database collection sections with the new sections
 */
export async function updateSections(
    sections: APIv4.Section[],
    term: APIv4.TermIdentifier,
) {
    logger.info(`Initiating section update with ${sections.length} sections`);
    const dbSections: DBSection[] = sections.map(sectionToDb);
    const bulk = collections.sections.initializeUnorderedBulkOp();
    for (let section of dbSections) {
        bulk.find({ _id: section._id }).upsert().replaceOne(section);
    }
    bulk.find({
        $and: [
            { "_id.term": term.term, "_id.year": term.year },
            { $nor: dbSections.map((s) => ({ _id: s._id })) },
        ],
    }).delete();
    logger.info(`Bulk operation compiled, executing...`);
    const result = await bulk.execute();
    const { nInserted, nMatched, nModified, nRemoved, nUpserted } = result;
    logger.info(`Bulk operation completed`);
    logger.info("Bulk operation result: %o", {
        ok: result.isOk(),
        nInserted,
        nMatched,
        nModified,
        nRemoved,
        nUpserted,
    });
    return result;
}

export async function getAllSections(
    term?: TermIdentifier,
): Promise<APIv4.Section[]> {
    const cursor = collections.sections.find(
        term === undefined
            ? {}
            : { "_id.term": term.term, "_id.year": term.year },
    );
    const arr = await cursor.toArray();
    return arr.map(dbToSection);
}
