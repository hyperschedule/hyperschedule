import { createLogger } from "../logger";
import { MongoClient } from "mongodb";
import type { Db } from "mongodb";

export type DBConnector =
    | {
          connected: false;
      }
    | {
          connected: true;
          db: Db;
          client: MongoClient;
      };

const logger = createLogger("db.connector");

export let connector: DBConnector = {
    connected: false,
};

export async function connectToDb(url: string): Promise<void> {
    const client = new MongoClient(url);

    logger.info("Initializing database connection");
    await client.connect();
    const db = client.db("hyperschedule");
    await db.command({
        ping: 1,
    });
    logger.info("Database connection established");

    Object.assign<DBConnector, DBConnector>(connector, {
        connected: true,
        db,
        client,
    });
}

export async function closeDb(): Promise<void> {
    // if it's not connected do nothing
    if (!connector.connected) return;

    const client = connector.client;
    connector = { connected: false };
    await client.close();

    logger.info("Database closed");
}
