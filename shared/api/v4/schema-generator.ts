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

const symbols: string[] = generator.getMainFileSymbols(program);
const schema = generator.getSchemaForSymbols(symbols);
const patched = Object.entries(schema.definitions!).map(([key, obj]) => {
    (obj as any)["$id"] = key;
    return obj as any;
});

const schemaString = JSON.stringify(
    patched,
    (key, value) => {
        if (key === "$ref")
            return (value as string).replaceAll("#/definitions/", "");
        return value;
    },
    2,
);

fs.writeFileSync(schemaFilePath, schemaString);
console.log(`Schema file written to ${schemaFilePath}`);
