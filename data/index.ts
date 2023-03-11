/**
 * We need this file so we can reliably determine the location of the data directory,
 * since everything in node is relative to either whichever file being executed or
 * the working directory, both of which are unreliable
 */

import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";

export const DATA_DIR_PATH = path.dirname(
    await fs.realpath(fileURLToPath(import.meta.url)),
);

/**
 * Save a file as a data file. Path is relative to the root of data module
 */
export async function saveDataFile(
    dirname: string,
    filename: string,
    data: string,
): Promise<void> {
    await fs.mkdir(path.join(DATA_DIR_PATH, dirname), {
        recursive: true,
    });
    return fs.writeFile(path.join(DATA_DIR_PATH, dirname, filename), data, {
        encoding: "utf-8",
    });
}

/**
 * Save a file as a data file. Path is relative to the root of data module
 */
export function loadDataFile(
    dirname: string,
    filename: string,
): Promise<string> {
    return fs.readFile(path.join(DATA_DIR_PATH, dirname, filename), {
        encoding: "utf-8",
    });
}
