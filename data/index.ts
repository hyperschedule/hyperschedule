/**
 * We need this file so we can reliably determine the location of the data directory,
 * since everything in node is relative to either whichever file being executed or
 * the working directory, both of which are unreliable
 */

import * as path from "path";
import { fileURLToPath } from "url";

export const DATA_DIR_PATH = path.dirname(
    path.resolve(fileURLToPath(import.meta.url)),
);
