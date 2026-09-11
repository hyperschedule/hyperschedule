import * as path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// list of usernames to exclude from contributors
const maintainerGithubUsernames: string[] = [
    "stuxf",
    "NextZtepS",
    "edonson2016",
    "mia1024",
    "kwshi",
    "raxod502",
    "ohowe1",
];
let contributors: string;
try {
    const fileData = JSON.parse(
        readFileSync(path.resolve(import.meta.dirname, "contributors.json"), {
            encoding: "utf-8",
        }),
    );
    contributors = JSON.stringify(
        fileData.filter(
            ({ username }) => !maintainerGithubUsernames.includes(username),
        ),
    );
} catch {
    contributors = JSON.stringify([
        {
            username: "",
            name: "Contributor placeholder (run `pnpm get-contributor` then restart frontend)",
        },
    ]);
}

const allocatedCssNumbers = new Map<string, number>();
let cssClassCounter = 0;

// generate a css class name. this function needs to be deterministic (hence the map)
function generateCssClassName(classname: string, filename: string) {
    // if we somehow managed have more than 2^32 css classes there are way more serious problems

    const indexString = filename + "__" + classname;
    let n: number | undefined = allocatedCssNumbers.get(indexString);
    if (n === undefined) {
        n = cssClassCounter++;
        allocatedCssNumbers.set(indexString, n);
    }

    const arr = new Uint32Array(1);
    arr[0] = n;
    const s = Buffer.from(arr).toString("base64url");
    if (s.match(/^\d/)) return "_" + s;
    return s;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        root: "src",
        envDir: import.meta.dirname,
        publicDir: path.resolve(import.meta.dirname, "dist"),
        cacheDir: path.resolve(
            import.meta.dirname,
            "..",
            "node_modules",
            ".vite",
        ),
        plugins: [react()],
        define: {
            // we need to use JSON.stringify to quote them because this is basically text replacement
            __API_URL__: JSON.stringify(env.HYPERSCHEDULE_API_URL),
            __CONTRIBUTOR_GH_NAMES__: contributors,
        },
        resolve: {
            extensions: [".ts", ".tsx"],
            alias: {
                "@components": path.join(import.meta.dirname, "src/components"),
                "@lib": path.join(import.meta.dirname, "src/lib"),
                "@hooks": path.join(import.meta.dirname, "src/hooks"),
                "@css": path.join(import.meta.dirname, "src/css"),
            },
        },
        css: {
            modules: {
                generateScopedName:
                    process.env.NODE_ENV !== "production"
                        ? "[local]__[path][name]"
                        : generateCssClassName,
            },
        },
        build: {
            target: "baseline-widely-available",
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    app: "src/index.html",
                    json: "src/data-viewer/data-viewer.html",
                    sw: "src/service-worker/sw.ts",
                },
                output: {
                    entryFileNames: "[name].js",
                    assetFileNames: "[name].[ext]",
                },
            },
            copyPublicDir: false,
            outDir: path.resolve(import.meta.dirname, "dist"),
            sourcemap: true,
        },
        server: {
            port: 3000,
            host: true,
        },
    };
});
