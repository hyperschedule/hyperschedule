import {defineConfig} from "vite";
import react from "@vitejs/plugin-react"

export default defineConfig({
    root: "src",
    plugins: [react()],
    resolve: {
        extensions: [".ts", ".tsx"],
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
        host: true
    }
});