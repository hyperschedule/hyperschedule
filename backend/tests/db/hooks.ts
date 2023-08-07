import { afterEach, beforeEach } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import { closeDb, connectToDb } from "../../src/db/connector";

export function setupDbHooks() {
    let mongod: MongoMemoryServer;

    beforeEach(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await connectToDb(uri);
    }, 30000);

    afterEach(async () => {
        await closeDb();
        await mongod.stop();
    }, 30000);
}
