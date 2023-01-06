import * as dotenv from "dotenv";
dotenv.config();

let DB_URL: string;

if (process.env.NODE_ENV === "production") {
    let url = process.env.DB_URL;
    if (url === undefined)
        throw Error("Cannot load DB_URL from environment variables");
    DB_URL = url;
} else if (process.env.NODE_ENV === "test") {
    DB_URL = ""; // will be set by test files
} else {
    DB_URL = "mongodb://hyperschedule:local_dev@127.0.0.1:27017";
}

export { DB_URL };
