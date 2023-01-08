import { server } from "../server";
import { schema as courseSchema } from "hyperschedule-shared/api/v4/schema";
import { Section } from "../db/models";
import { dbToSection } from "../db/utils";
import { Term } from "hyperschedule-shared/api/v4";
import type { SomeJSONSchema } from "ajv/dist/types/json-schema";

const validTerms: string[] = Object.values(Term);

export function registerCourseRoutes() {
    for (let obj of courseSchema) server.addSchema(obj);

    // path for all courses
    server.get(
        "/v4/sections",
        {
            schema: {
                response: {
                    200: { type: "array", items: { $ref: "Section" } },
                },
            },
        },
        async (request, reply) => {
            server.log.info({ msg: "DB query start", reqId: request.id });

            const sections = (await Section.find({}).lean().exec()).map(
                dbToSection,
            );

            server.log.info({ msg: "DB query end", reqId: request.id });
            return reply
                .header("Access-Control-Allow-Origin", "*")
                .send(sections);
        },
    );

    // path for querying courses by semester

    server.get<{ Params: { term: string; year: string } }>(
        "/v4/sections/:term/:year",
        {
            schema: {
                response: {
                    200: {
                        type: "array",
                        items: { $ref: "Section" },
                        required: [],
                    },
                },
                params: {
                    type: "object",
                    properties: {
                        term: { type: "string" },
                        year: { type: "string" },
                    },
                    required: ["term", "year"],
                } satisfies SomeJSONSchema,
            },
        },
        async (request, reply) => {
            const year = parseInt(request.params.year, 10);
            if (isNaN(year))
                return reply
                    .status(400)
                    .send(`Invalid year ${request.params.year}`);
            const term = request.params.term.toUpperCase();
            if (!validTerms.includes(term))
                return reply
                    .status(400)
                    .send(
                        `Invalid term ${request.params.term}. Options are ${validTerms}.`,
                    );

            server.log.info({ msg: "DB query start", reqId: request.id });

            const sections = (
                await Section.find({})
                    .where("_id.year")
                    .equals(year)
                    .where("_id.term")
                    .equals(term)
                    .lean()
                    .exec()
            ).map(dbToSection);

            server.log.info({ msg: "DB query end", reqId: request.id });
            return reply
                .header("Access-Control-Allow-Origin", "*")
                .send(sections);
        },
    );
}
