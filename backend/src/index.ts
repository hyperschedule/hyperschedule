import { createRootLogger, createLogger } from "./logger";

createRootLogger("server");

// we use lazy import here to make sure createRootLogger can be executed first
const { connectToDb } = await import("./db");
const { DB_URL } = await import("./db/credentials");
const { server: app } = await import("./server");

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
