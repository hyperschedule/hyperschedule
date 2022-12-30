import * as path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import pcssComment from "postcss-comment";
import pcssNesting from "postcss-nesting";
import pcssCustomMedia from "postcss-custom-media";

export default defineConfig({
    root: "src",
    plugins: [react()],
    resolve: {
        extensions: [".ts", ".tsx"],
        alias: {
            "@components": path.join(__dirname, "src/components"),
        },
    },
    css: {
        postcss: {
            parser: pcssComment,
            plugins: [pcssNesting, pcssCustomMedia],
        },
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: {
                app: "src/index.html",
            },
        },
        sourcemap: true,
    },
    server: {
        port: 5000,
        host: true,
    },
});
