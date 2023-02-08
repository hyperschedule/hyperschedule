import { createLogger } from "@/logger";
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

export async function connectToDb(url: string) {
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

export async function closeDb() {
    // if it's not connected do nothing
    if (!connector.connected) return;

    logger.info("Closing database");
    await connector.client.close();

    /* eslint-disable
    @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-unsafe-member-access */

    let tmp = connector as any;

    tmp.connected = false;
    delete tmp.db;
    delete tmp.client;

    /* eslint-enable */

    logger.info("Database closed");
}
