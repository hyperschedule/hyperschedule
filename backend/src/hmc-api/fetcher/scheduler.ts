import { endpoints } from "./endpoints";
import type { Endpoint, HmcApiFiles } from "./types";
import { fetchAllForTerm, fetchAndSave, loadAllForTerm } from "./fetch";
import { createLogger } from "../../logger";
import { setTimeout } from "node:timers/promises";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import { linkCourseData } from "../data-linker";
import { updateSections } from "../../db/models/course";
import process from "node:process";

// we wrap everything in this function so nothing happens on import
export async function runScheduler(prefix: string): Promise<void> {
    const logger = createLogger("hmc.fetch.scheduler");
    let endpointsScheduled: number = 0;
    let dbWriteInProcess: number = 0;
    let shouldExit: boolean = false;
    const totalEndpoints = Object.keys(endpoints).length;

    logger.info("Starting scheduler with prefix %s", prefix);

    // we save a copy of everything in memory so we don't have to constantly loading them from the disk
    // if we ever run fetcher from multiple processes (don't plan to), this will cause horrible race condition
    let inMemoryFiles: HmcApiFiles;
    try {
        logger.info("Initializing memory file store");
        inMemoryFiles = await loadAllForTerm(CURRENT_TERM);
    } catch (e: any) {
        if (e.code === "ENOENT") {
            logger.info("No initial files found, fetching all...");
            await fetchAllForTerm(prefix, CURRENT_TERM);
            inMemoryFiles = await loadAllForTerm(CURRENT_TERM);

            logger.info("Initial files fetched, populating database...");
            const data = linkCourseData(inMemoryFiles, CURRENT_TERM);
            await updateSections(data, CURRENT_TERM);

            logger.info("Initial database population completed");
        } else {
            logger.error("Cannot load initial data files");
            logger.error(e);
            process.exit(1);
        }
    }

    async function scheduleEndpoint(e: Endpoint): Promise<void> {
        logger.info(
            "Scheduling fetch for %s with interval of %ds, %d/%d",
            e.saveAs,
            e.interval,
            ++endpointsScheduled,
            totalEndpoints,
        );
        await setTimeout(e.interval * 1000);

        /* eslint-disable no-await-in-loop, @typescript-eslint/no-unnecessary-condition */
        while (true) {
            try {
                logger.info("Fetching for %s", e.saveAs);
                inMemoryFiles[e.name] = await fetchAndSave(
                    prefix,
                    e,
                    CURRENT_TERM,
                );
                logger.info("Data for %s fetched", e.saveAs);

                const newSections = linkCourseData(inMemoryFiles, CURRENT_TERM);
                logger.info("Data linking complete");

                dbWriteInProcess++;
                try {
                    await updateSections(newSections, CURRENT_TERM);
                } finally {
                    dbWriteInProcess--;
                }
                logger.info("Database updated", e.saveAs);

                logger.info(
                    "Scheduler flow completed for %s, running again in %ds",
                    e.saveAs,
                    e.interval,
                );
            } catch (error) {
                logger.error("Error while running flow for %s", e.saveAs);
                logger.error(error);
            }
            if (shouldExit) return;
            await setTimeout(e.interval * 1000);
        }
        /* eslint-enable */
    }

    function signalHandler(signal: string): void {
        logger.info("Signal %s received", signal);
        shouldExit = true;
        if (dbWriteInProcess === 0) {
            logger.info("No pending database write, terminating process");
            process.exit(0);
        } else {
            logger.info("Waiting for pending database write...");
        }
    }

    process.on("SIGINT", signalHandler);
    process.on("SIGTERM", signalHandler);
    process.on("SIGABRT", signalHandler);
    process.on("SIGQUIT", signalHandler);

    for (const e of Object.values(endpoints)) void scheduleEndpoint(e);
}
