import * as path from "path";
import { fileURLToPath } from "url";

export const DATA_DIR_PATH = path.dirname(
    path.resolve(fileURLToPath(import.meta.url)),
);
