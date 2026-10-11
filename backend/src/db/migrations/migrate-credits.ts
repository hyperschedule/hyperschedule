import { connectToDb, closeDb, connector } from "../connector";
import { DB_URL } from "../credentials";
import { collections } from "../collections";
import { dbToSection } from "../utils";
import {
    convertToHMCCredits,
    convertToNonHMCCredits,
} from "../../hmc-api/credits";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { createLogger } from "../../logger";

const logger = createLogger("db.migrate-credits");

async function migrateCredits(): Promise<void> {
    logger.info("Connecting to DB...");
    await connectToDb(DB_URL);

    if (!connector.connected) {
        throw new Error("Database not connected");
    }

    // Find all sections missing HMCCredits or nonHMCCredits
    const cursor = collections.sections.find({
        $or: [
            { HMCCredits: { $exists: false } },
            { nonHMCCredits: { $exists: false } },
        ],
    });

    const docs = await cursor.toArray();
    logger.info(`Found ${docs.length} sections to migrate.`);

    if (docs.length === 0) {
        logger.info("No documents need migration.");
        await closeDb();
        return;
    }

    const bulk = collections.sections.initializeUnorderedBulkOp();

    for (const doc of docs) {
        const section = dbToSection(doc);
        const sectionIdStr = APIv4.stringifySectionCodeLong(section.identifier);
        const primaryAssoc = section.course.primaryAssociation;

        const HMCCredits = convertToHMCCredits(
            section.credits,
            primaryAssoc,
            sectionIdStr,
        );
        const nonHMCCredits = convertToNonHMCCredits(
            section.credits,
            primaryAssoc,
            sectionIdStr,
        );

        bulk.find({ _id: doc._id }).updateOne({
            $set: {
                HMCCredits,
                nonHMCCredits,
            },
        });
    }

    logger.info("Executing bulk update...");
    const result = await bulk.execute();
    logger.info("Migration completed: %o", {
        nMatched: result.matchedCount,
        nModified: result.modifiedCount,
    });

    await closeDb();
}

migrateCredits().catch((err) => {
    logger.error("Migration failed: %o", err);
    process.exit(1);
});
