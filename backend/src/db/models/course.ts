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
    logger.info(`Starting database transaction to update sections`);
    const session = collections.startSession();
    session.startTransaction();
    try {
        logger.info(
            `Initiating section update with ${sections.length} sections`,
        );
        const dbSections: DBSection[] = sections.map(sectionToDb);

        const dbSectionCollection = collections.sections();

        await dbSectionCollection.deleteMany(
            {
                $and: [
                    { "_id.term": term.term, "_id.year": term.year },
                    { $nor: dbSections.map((s) => ({ _id: s._id })) },
                ],
            },
            { session },
        );

        await Promise.all(
            dbSections.map((section) =>
                dbSectionCollection.replaceOne({ _id: section._id }, section, {
                    upsert: true,
                    session,
                }),
            ),
        );
        const result = await session.commitTransaction();
        logger.info("Transaction committed, result: %O", result);
    } catch (e) {
        logger.error(e);
        await session.abortTransaction();
        logger.info("Transaction aborted");
        throw e
    } finally {
        await session.endSession();
    }
}

export async function getAllSections(
    term?: TermIdentifier,
): Promise<APIv4.Section[]> {
    logger.trace("DB query start for all sections");
    const cursor = collections
        .sections()
        .find(
            term === undefined
                ? {}
                : { "_id.term": term.term, "_id.year": term.year },
        );
    const arr = await cursor.toArray();
    logger.trace("DB query completed for all sections");
    return arr.map(dbToSection);
}
