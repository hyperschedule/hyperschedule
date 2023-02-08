import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    root: "src",
    envDir: __dirname,
    define: {
        // global: {},
        // "process.env": process.env,
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@": resolve(__dirname, "src"),
            "@db": resolve(__dirname, "src", "db"),
            "@hmc-api": resolve(__dirname, "src", "hmc-api"),
            "@routes": resolve(__dirname, "src", "routes"),
            "@auth": resolve(__dirname, "src", "auth"),
        },
    },
    server: {
        port: 8080,
    },
});
