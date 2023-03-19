import { endpoints } from "./endpoints";
import type { Endpoint, HmcApiFiles } from "./types";
import { fetchAllForTerm, fetchAndSave, loadAllForTerm } from "./fetch";
import { createLogger } from "../../logger";
import { setInterval } from "node:timers/promises";
import { CURRENT_TERM } from "../../current-term";
import { linkCourseData } from "../data-linker";
import { updateSections } from "../../db/models/course";
import process from "node:process";

// we wrap everything in this function so nothing happens on import
export async function runScheduler() {
    const logger = createLogger("hmc.fetch.scheduler");
    const controller = new AbortController();

    let endpointsScheduled: number = 0;
    const totalEndpoints = Object.keys(endpoints).length;

    // we save a copy of everything in memory so we don't have to constantly loading them from the disk
    // if we ever run fetcher from multiple processes (don't plan to), this will cause horrible race condition
    let inMemoryFiles: HmcApiFiles;
    try {
        logger.info("Initializing memory file store");
        inMemoryFiles = await loadAllForTerm(CURRENT_TERM);
    } catch (e: any) {
        if (e.code === "ENOENT") {
            logger.info("No initial files found, fetching all...");
            await fetchAllForTerm(CURRENT_TERM);
            inMemoryFiles = await loadAllForTerm(CURRENT_TERM);
        } else {
            logger.error("Cannot load initial data files");
            logger.error(e);
            process.exit(1);
        }
    }

    async function scheduleEndpoint(e: Endpoint) {
        logger.info(
            "Scheduling fetch for %s with interval of %ds, %d/%d",
            e.saveAs,
            e.interval,
            ++endpointsScheduled,
            totalEndpoints,
        );

        (async function () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of setInterval(e.interval * 1000, undefined, {
                signal: controller.signal,
            })) {
                try {
                    logger.info("Fetching for %s", e.saveAs);
                    inMemoryFiles[e.name] = await fetchAndSave(e, CURRENT_TERM);
                    logger.info("Data for %s fetched", e.saveAs);

                    const newSections = linkCourseData(
                        inMemoryFiles,
                        CURRENT_TERM,
                    );
                    logger.info("Data linking complete");

                    await updateSections(newSections, CURRENT_TERM);
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
            }
        })().catch((error) => {
            if (error.name === "AbortError") {
                logger.info(
                    "Fetch schedule for %s canceled, %d/%d remain scheduled",
                    e.saveAs,
                    --endpointsScheduled,
                    totalEndpoints,
                );
                if (endpointsScheduled === 0) process.exit(0);
            }
        });
    }

    function signalHandler(signal: string) {
        if (!controller.signal.aborted) {
            logger.info(
                "Signal %s received, cancelling all scheduled tasks",
                signal,
            );
            controller.abort();
        }
    }

    process.on("SIGINT", signalHandler);
    process.on("SIGTERM", signalHandler);
    process.on("SIGABRT", signalHandler);
    process.on("SIGQUIT", signalHandler);

    for (const e of Object.values(endpoints)) void scheduleEndpoint(e);
}
