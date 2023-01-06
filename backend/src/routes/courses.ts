import { server } from "../server";
import { schema as courseSchema } from "hyperschedule-shared/api/v4/schema";
import { Section } from "../db/models";
import fastify from "fastify";
import * as console from "console";
import { dbToSection, sectionToDb } from "../db/utils";

export function registerCourseRoutes() {
    for (let obj of courseSchema) server.addSchema(obj);

    server.get(
        "/v4/courses",
        {
            schema: {
                response: {
                    200: { type: "array", items: { $ref: "Section" } },
                },
            },
        },
        async (request, reply) => {
            server.log.info("DB query start");

            const sections = (await Section.find({}).lean().exec()).map(
                dbToSection,
            );

            console.log(sections);
            server.log.info("DB query end");
            return reply
                .header("Access-Control-Allow-Origin", "*")
                .send(sections);
        },
    );
}
