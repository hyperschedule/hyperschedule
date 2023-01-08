import * as mongoose from "mongoose";
import { DB_URL } from "./credentials";
import { rootLogger } from "../logger";

export async function connectToDb() {
    rootLogger.info("Initializing database connection");
    mongoose.set({ strictQuery: true });
    await mongoose.connect(DB_URL, {
        keepAlive: true,
        keepAliveInitialDelay: 300000,
        serverSelectionTimeoutMS: 5000,
        dbName: "hyperschedule",
    });
    rootLogger.info("Database connection established");
}
