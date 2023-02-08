import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        include: ["**/tests/**/*.test.ts"],
        watch: false,
        alias: {
            "@": resolve(__dirname, "src"),
            "@db": resolve(__dirname, "src", "db"),
            "@hmc-api": resolve(__dirname, "src", "hmc-api"),
            "@routes": resolve(__dirname, "src", "routes"),
            "@auth": resolve(__dirname, "src", "auth"),
        },
    },
});
