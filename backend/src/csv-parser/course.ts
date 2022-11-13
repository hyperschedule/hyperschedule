import * as fs from "fs/promises";
import { parseBssv } from "./bssv";

async function main() {
    const full = await fs.readFile("sample/course.bssv", "utf8");
    const result = parseBssv(
        {
            rawCode: "externalId",
            title: "courseTitle",
            campus: "institutionExternalId",
            description: "description",
        },
        full,
    );
    console.log(result);
}

main();
