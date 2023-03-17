import * as APIv4 from "hyperschedule-shared/api/v4";

import { DATA_DIR_PATH } from "hyperschedule-data";
import type { Endpoint, Endpoints, ParamOptions } from "./types";
import { Params } from "./types";
import { resolve, dirname } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import { HmcApiFiles } from "./types";
import { endpoints } from "./endpoints";
import { createLogger } from "../../logger";

const logger = createLogger("hmc.fetcher.utils");

/**
 * since each endpoint requires different parameter, we use this to generate all of them
 */
export function computeParams(term: APIv4.TermIdentifier): Params {
    return Params.parse({
        session: term.term,
        year: term.year.toString(),
        catalog: `UG${
            (term.term === APIv4.Term.fall ? term.year : term.year - 1) % 100
        }`,
    } satisfies Params);
}

export function computeFilePath(
    endpoint: Endpoint,
    term: APIv4.TermIdentifier,
) {
    return resolve(
        DATA_DIR_PATH,
        APIv4.stringifyTermIdentifier(term),
        endpoint.saveAs,
    );
}

/**
 * loads a static file from the data directory corresponding to the endpoint
 */
export function loadStatic(
    endpoint: Endpoint,
    term: APIv4.TermIdentifier,
): Promise<string> {
    const path = computeFilePath(endpoint, term);
    try {
        return readFile(computeFilePath(endpoint, term), { encoding: "utf-8" });
    } catch (e) {
        logger.error("Cannot read file %s from disk", path);
        throw e;
    }
}

/**
 * saves the result of an endpoint call to the data directory
 */
export async function saveStatic(
    content: string,
    endpoint: Endpoint,
    term: APIv4.TermIdentifier,
) {
    const path = computeFilePath(endpoint, term);

    // TODO: figure out somewhere else to call this so we don't try to run mkdir for every new file
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });

    const buf = Buffer.from(content, "utf-8");
    // writes the content of the file using utf-8 encoding, even if the underlying data might not be
    // properly encoded. that's why we have the fixEncoding function
    await writeFile(path, buf, {
        encoding: "utf-8",
    });
    logger.info(`File ${path} written (${(buf.length / 1024).toFixed(2)} KB)`);
}

export async function loadCourseFiles(
    term: APIv4.TermIdentifier,
): Promise<HmcApiFiles> {
    /* TODO: rewrite this function to use Promise.all for better performance. This
             should be low priority because we only really load static files during 
             server startup. 
    */
    const obj: Record<string, string> = {};
    for (const [name, endpoint] of Object.entries(endpoints) as [
        keyof Endpoints,
        Endpoint,
    ][]) {
        // eslint-disable-next-line no-await-in-loop
        obj[name] = await readFile(computeFilePath(endpoint, term), {
            encoding: "utf-8",
        });
    }
    return HmcApiFiles.parse(obj);
}

/**
 * a convenient function to make ParamOptions by specifying used fields. e.g.
 * setUsedParams("year", "session")
 */
export function setUsedParams(...args: (keyof ParamOptions)[]): ParamOptions {
    const out: ParamOptions = {
        session: false,
        catalog: false,
        year: false,
    };
    for (const k of args) out[k] = true;
    return out;
}
