import { collections } from "../collections";
import type { DBSection } from "../collections";
import { dbToSection, sectionToDb } from "../utils";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import { z } from "zod";

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
    term?: APIv4.TermIdentifier,
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
    term: APIv4.TermIdentifier,
): Promise<APIv4.SectionIdentifier[]> {
    logger.trace("DB query start for all section id");
    const cursor = collections.sections
        .find(
            {
                "_id.term": term.term,
                "_id.year": term.year,
            },
            { projection: { _id: 1 } },
        )
        .map((s) => s._id);
    const arr = await cursor.toArray();
    logger.trace("DB query completed for all section ids");
    return arr;
}

function sortTermIdentifierReverse(
    a: APIv4.TermIdentifier,
    b: APIv4.TermIdentifier,
) {
    if (APIv4.termIsBefore(a, b)) return 1;
    if (a.year === b.year && a.term === b.term) return 0;
    return -1;
}

const AggregationOutput = z.object({
    terms: APIv4.TermIdentifier.array(),
    code: APIv4.CourseCodeString,
});

export async function computeOfferingHistory(term: APIv4.TermIdentifier) {
    logger.info("DB query start for last offered");
    const aggr = await collections.sections
        .aggregate([
            {
                $project: {
                    _id: 1,
                    code: {
                        // this entire stage is basically doing a stringifyCourseCode and set to a separate variable "code"
                        $reduce: {
                            input: [
                                "$_id.department",
                                " ",
                                { $toString: "$_id.courseNumber" },
                                "$_id.suffix",
                                " ",
                                "$_id.affiliation",
                            ],
                            initialValue: "",
                            in: { $concat: ["$$value", "$$this"] },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$code",
                    terms: {
                        $addToSet: { term: "$_id.term", year: "$_id.year" },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    code: "$_id",
                    terms: 1,
                },
            },
            {
                // filter for results containing stuff from the specified term
                $match: {
                    terms: {
                        $elemMatch: term,
                    },
                },
            },
        ])
        .toArray();
    logger.info("DB query end for last offered");
    const res: APIv4.OfferingHistory[] = [];
    for (const doc of aggr) {
        const parsed = AggregationOutput.safeParse(doc);
        if (!parsed.success) {
            logger.warn(
                "Unexpected failure on aggregation %o %o",
                doc,
                parsed.error,
            );
            continue;
        }
        parsed.data.terms.sort(sortTermIdentifierReverse);

        res.push({
            code: APIv4.parseCourseCode(parsed.data.code),
            terms: parsed.data.terms,
        });
    }
    return res;
}

// figure out which terms we have data for
export async function computeAllTerms() {
    logger.info("DB query start for all terms");
    const result = await collections.sections
        .aggregate([
            {
                $project: {
                    _id: false,
                    term: {
                        $concat: ["$_id.term", { $toString: "$_id.year" }],
                    },
                },
            },
            {
                $group: {
                    _id: "$term",
                },
            },
        ])
        .toArray();

    const arr: APIv4.TermIdentifier[] = [];
    for (const doc of result) {
        const s = APIv4.TermIdentifierString.parse(doc._id);
        const term = APIv4.parseTermIdentifier(s);
        arr.push(term);
    }
    arr.sort(sortTermIdentifierReverse);

    return arr;
}
