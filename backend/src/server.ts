import fastify from "fastify";
import fs from "fs";
import { rootLogger } from "./logger";
import { schema as courseSchema } from "hyperschedule-shared/api/v4/schema";

const server = fastify({ logger: rootLogger });
for (let obj of courseSchema) server.addSchema(obj);

const courses = JSON.parse(
    fs.readFileSync("./src/hmc-api/sample/parsed-sample-v4.json", {
        encoding: "utf-8",
    }),
);

server.get(
    "/v4/courses",
    {
        schema: {
            response: { 200: { type: "array", items: { $ref: "Section" } } },
        },
    },
    async (request, response) => {
        return courses;
    },
);

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        rootLogger.error(err);
        process.exit(0);
    }
});
