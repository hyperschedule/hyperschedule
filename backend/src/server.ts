import fastify from "fastify";
import { rootLogger } from "./logger";
import { connectToDb } from "./db";
import { registerCourseRoutes } from "./routes/courses";

// creating server and schemas
export const server = fastify({ logger: rootLogger });

registerCourseRoutes();

// initializing database connection
await connectToDb();

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        rootLogger.error(err);
        process.exit(1);
    }
});
