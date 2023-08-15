import * as path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// fix the weird thing with use-sync-external-store, imported by both zustand and react-query
// this is only needed for production build. this module doesn't even matter because we are
// already using react 18
let useSyncExternalStoreFix = {};
if (process.env.NODE_ENV === "production") {
    useSyncExternalStoreFix = {
        "use-sync-external-store/shim": path.dirname(
            require.resolve("use-sync-external-store"),
        ),
    };
}

export default defineConfig({
    root: "src",
    envDir: __dirname,
    plugins: [react()],
    resolve: {
        extensions: [".ts", ".tsx"],
        alias: {
            "@components": path.join(__dirname, "src/components"),
            "@lib": path.join(__dirname, "src/lib"),
            "@hooks": path.join(__dirname, "src/hooks"),
            ...useSyncExternalStoreFix,
        },
    },
    css: {},
    ssr: { external: ["@babel/runtime"] },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: {
                app: "src/index.html",
            },
        },
        outDir: path.resolve(__dirname, "dist"),
        sourcemap: true,
    },
    server: {
        port: 5000,
        host: true,
    },
});
