import { createLogger } from "./logger";
import { connectToDb } from "./db";
import { DB_URL } from "./db/credentials";
import { app } from "./server";

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
