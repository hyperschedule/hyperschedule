/* eslint-disable */
// we need to do this because https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
// once this is resolved we can also remove the dependency on undici
import * as process from "process";

declare global {
    export const {
        fetch,
        FormData,
        Headers,
        Request,
        Response,
    }: typeof import("undici");
}
export {};
/* eslint-enable */
import { createLogger } from "../../logger";
import { endpoints, endpointAuthorization } from "./endpoints";
import * as APIv4 from "hyperschedule-shared/api/v4";
import type { Endpoint } from "./types";
import { computeParams, saveStatic } from "./utils";

const logger = createLogger("hmc.fetcher");

async function doFetch(endpoint: Endpoint, term: APIv4.TermIdentifier) {
    const params = computeParams(term);
    const link =
        endpoint.param === null
            ? endpoint.link
            : `${endpoint.link}?${new URLSearchParams({
                  [endpoint.param.toUpperCase()]: params[endpoint.param],
              }).toString()}`;

    return fetch(link, {
        headers: {
            authorization: endpointAuthorization,
            "user-agent": "Hyperschedule Crawler",
        },
    });
}

async function fetchAndSave(
    endpoint: Endpoint,
    term: APIv4.TermIdentifier,
): Promise<string> {
    const timeStart = new Date().getTime();
    logger.info(`Sending request for ${endpoint.saveAs}`);
    const res = await doFetch(endpoint, term);
    if (!res.ok) {
        logger.error(
            `Failed to fetch (${res.status}) for ${
                endpoint.saveAs
            } for term ${APIv4.stringifyTermIdentifier(term)}`,
        );
        logger.error("Headers: %O", res.headers);
        logger.error("Body: %O", await res.text());
        throw Error("Failed to fetch");
    }
    logger.info(`Request for ${endpoint.saveAs} completed, saving to disk`);
    const content = await res.text();

    // replace CRLF ending to LF ending
    await saveStatic(content.replace(/\r\n/g, "\n"), endpoint, term);

    logger.info(
        `Fetch flow for ${endpoint.saveAs} completed in ${(
            (new Date().getTime() - timeStart) /
            1000
        ).toFixed(3)}s`,
    );
    return content;
}

/**
 * Fetches every single resource simultaneously. This function should not be called in production.
 */
export async function fetchAllForTerm(term: APIv4.TermIdentifier) {
    if (process.env.NODE_ENV === "production")
        throw Error("Don't fetch all data at once in production");
    const jobs = Object.values(endpoints).map((endpoint) =>
        fetchAndSave(endpoint, term),
    );
    const results = await Promise.allSettled(jobs);

    // we don't want to log the actual return value (all the data) if fulfilled
    logger.info(
        results.map((r) => (r.status === "fulfilled" ? "fulfilled" : r.reason)),
    );
}
