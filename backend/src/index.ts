import { connectToDb } from "./db";
import { DB_URL } from "@db/credentials";
import { server as app } from "./server";
import { createLogger } from "./logger";

const logger = createLogger("index");

try {
    // initializing database connection
    await connectToDb(DB_URL);
    const server = app.listen(8080, () => {
        logger.info(`Server listening on %O`, server.address());
    });
} catch (e) {
    logger.error(`Error starting server: ${e}`);
}
