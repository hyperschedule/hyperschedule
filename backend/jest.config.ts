import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    verbose: true,
    testEnvironment: "node",
    preset: "ts-jest/presets/default-esm",
    testMatch: ["**/tests/**/*.test.ts"],
    cache: false,
};

export default config;
