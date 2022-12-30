/* eslint-disable */

import * as fs from "fs";
import { resolve } from "path";
import * as TJS from "typescript-json-schema";

const v4Path = resolve(process.cwd(), "api", "v4");
const schemaFilePath = resolve(v4Path, "schema.json");

const settings: TJS.PartialArgs = {
    required: true,
    aliasRef: true,
    topRef: true,
};

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
    strict: true,
    noUncheckedIndexedAccess: true,
    resolveJsonModule: true,
    esModuleInterop: true,
};

const program = TJS.getProgramFromFiles(
    [resolve(v4Path, "index.ts")],
    compilerOptions,
);

const generator = TJS.buildGenerator(program, settings, [
    resolve(v4Path, "index.ts"),
])!;

const symbols = generator.getMainFileSymbols(program);
const schemaString = JSON.stringify(
    generator.getSchemaForSymbols(symbols),
    null,
    2,
);

fs.writeFileSync(schemaFilePath, schemaString);
console.log(`Schema file written to ${schemaFilePath}`);
