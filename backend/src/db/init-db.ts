import type * as APIv4 from "hyperschedule-shared/api/v4";
import { connect, disconnect, set } from "mongoose";
import { readFile } from "fs/promises";
import type { DBSection } from "./models";
import { Section } from "./models";
import { DB_URL } from "./credentials";
import { sectionToDb } from "./utils";
set("strictQuery", true);

console.log("Connecting to db...");
await connect(DB_URL, {
    serverSelectionTimeoutMS: 3000,
});
console.log("db connected");
const data = JSON.parse(
    await readFile("src/hmc-api/sample/parsed-sample-v4.json", {
        encoding: "utf-8",
    }),
) as APIv4.Section[];

await Section.insertMany<DBSection>(data.map(sectionToDb));
console.log("Sample data loaded");
await disconnect();
