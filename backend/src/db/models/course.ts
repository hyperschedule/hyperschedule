import { collections } from "../collections";
import type { DBSection } from "../collections";
import { dbToSection, sectionToDb } from "../utils";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";
import type { TermIdentifier } from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "../../current-term";

const logger = createLogger("db.course");

/**
 * Replaces the existing database collection sections with the new sections
 */
export async function updateSections(
    sections: APIv4.Section[],
    term: APIv4.TermIdentifier,
) {
    logger.info(`Initiating section update with ${sections.length} sections`);
    const dbSections: DBSection[] = sections
        .filter(
            (s) =>
                s.identifier.term === term.term &&
                s.identifier.year === term.year,
        )
        .map(sectionToDb);
    logger.info(
        `Writing ${
            dbSections.length
        } sections for ${APIv4.stringifyTermIdentifier(term)}`,
    );
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
    if (!result.isOk()) {
        logger.error(result);
        throw Error("Database operation failed");
    }
    return result;
}

export async function getAllSections(
    term?: TermIdentifier,
): Promise<APIv4.Section[]> {
    term = term ?? CURRENT_TERM;

    logger.trace("DB query start for all sections");
    const cursor = collections.sections.find({
        "_id.term": term.term,
        "_id.year": term.year,
    });
    const arr = await cursor.toArray();
    logger.trace("DB query completed for all sections");
    return arr.map(dbToSection);
}

export async function getAllSectionId(
    term: TermIdentifier,
): Promise<DBSection[]> {
    logger.trace("DB query start for all section id");
    const cursor = collections.sections.find(
        {
            "_id.term": term.term,
            "_id.year": term.year,
        },
        { projection: { _id: 1 } },
    );
    const arr = await cursor.toArray();
    logger.trace("DB query completed for all section ids");
    return arr;
}
