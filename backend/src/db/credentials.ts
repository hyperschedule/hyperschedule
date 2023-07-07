import * as process from "process";

let DB_URL: string;

let url = process.env.DB_URL;
if (url === undefined)
    throw Error("Cannot load DB_URL from environment variables");
DB_URL = url;

export { DB_URL };
