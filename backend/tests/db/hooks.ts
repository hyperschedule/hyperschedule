import { afterEach, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { closeDb, connectToDb } from "../../src/db/connector";

export function setupDbHooks() {
    let mongod: MongoMemoryServer;

    beforeEach(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await connectToDb(uri);
    });

    afterEach(async () => {
        await closeDb();
        await mongod.stop();
    });
}
