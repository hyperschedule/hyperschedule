/* eslint-disable */

import * as fs from "fs";
import { resolve } from "path";
import * as TJS from "typescript-json-schema";
import prettier from "prettier";

const v4Path = resolve(process.cwd(), "api", "v4");
const schemaFilePath = resolve(v4Path, "schema.ts");

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

fs.writeFileSync(
    schemaFilePath,
    prettier.format(
        `// this file is auto-generated, please see schema-generator.ts. To regenerate, run yarn generate-schema
    export const schema=${schemaString}`,
        { trailingComma: "all", parser: "typescript", tabWidth: 4 },
    ),
);

console.log(`Schema file written to ${schemaFilePath}`);
