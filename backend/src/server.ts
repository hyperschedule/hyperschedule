import fastify from "fastify";
import { createLogger } from "./logger";
import { connectToDb } from "./db";
import { registerCourseRoutes } from "./routes/courses";
import { DB_URL } from "./db/credentials";

const logger = createLogger("server.init");

// creating server and schemas
export const server = fastify({ logger: createLogger("server.routes") });

registerCourseRoutes();

try {
    // initializing database connection
    await connectToDb(DB_URL);
    const addr = await server.listen({ port: 8080 });
    logger.info(`server listening on ${addr}`);
} catch (e) {
    logger.error(`Error starting server: ${e}`);
}
