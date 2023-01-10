import * as dotenv from "dotenv";
import * as process from "process";

dotenv.config();

let DB_URL: string;

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    let url = process.env.DB_URL;
    if (url === undefined)
        throw Error("Cannot load DB_URL from environment variables");
    DB_URL = url;
} else {
    DB_URL = "mongodb://hyperschedule:local_dev@127.0.0.1:27017/";
}

export { DB_URL };
