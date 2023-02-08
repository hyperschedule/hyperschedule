import type { TermIdentifier } from "hyperschedule-shared/api/v4";
import { Term } from "hyperschedule-shared/api/v4";
import { getAllSections } from "@db/models/course";
import { App } from "@tinyhttp/app";

const courseApp = new App({ settings: { xPoweredBy: false } });

const validTerms: string[] = Object.values(Term);

courseApp.get("/sections", async function (request, reply) {
    const sections = await getAllSections();
    return reply
        .header("Content-Type", "application/json")
        .send(JSON.stringify(sections));
});

courseApp.get("/sections/:year/:term", async (request, reply) => {
    const year = parseInt(request.params.year!, 10);
    if (isNaN(year))
        return reply.status(400).send(`Invalid year ${request.params.year}`);
    const term = request.params.term!.toUpperCase();
    if (!validTerms.includes(term))
        return reply
            .status(400)
            .send(
                `Invalid term ${request.params.term}. Options are ${validTerms}.`,
            );

    const sections = await getAllSections({
        term,
        year,
    } as TermIdentifier);

    return reply
        .header("Content-Type", "application/json")
        .send(JSON.stringify(sections));
});

export { courseApp };
