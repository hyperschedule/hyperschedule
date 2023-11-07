import * as APIv4 from "hyperschedule-shared/api/v4";
import { computeOfferingHistory, getAllSections } from "../../db/models/course";
import { App } from "@tinyhttp/app";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import { loadStatic } from "../../hmc-api/fetcher/utils";
import { endpoints } from "../../hmc-api/fetcher/endpoints";

const courseApp = new App({ settings: { xPoweredBy: false } });

courseApp.get("/sections", async function (request, reply) {
    const sections = await getAllSections();
    return reply
        .header("Content-Type", "application/json")
        .header(
            "Cache-Control",
            // if the server is down, serve cached data for at most another day
            "public,immutable,s-max-age=15,max-age=30,stale-while-revalidate=60,stale-if-error=86400",
        )
        .send(JSON.stringify(sections));
});

courseApp.get("/sections/:term", async (request, response) => {
    const parsed = APIv4.TermIdentifierString.safeParse(request.params.term);
    if (!parsed.success) return response.status(404).end();
    const requestedTerm = APIv4.parseTermIdentifier(parsed.data);
    if (APIv4.termIsBefore(CURRENT_TERM, requestedTerm))
        return response.status(404).end();

    if (APIv4.termIsBefore(requestedTerm, CURRENT_TERM)) {
        response.header("Cache-Control", `public,immutable,max-age=3600`);
    } else {
        response.header(
            "Cache-Control",
            // if the server is down, serve cached data for at most another day.
            // we use immutable here to reduce server load, as the max age is
            // very short
            "public,immutable,s-max-age=15,max-age=30,stale-while-revalidate=60,stale-if-error=86400",
        );
    }
    const sections = await getAllSections(requestedTerm);

    return response
        .header("Content-Type", "application/json")
        .send(JSON.stringify(sections));
});

courseApp.get("/course-areas", async function (request, reply) {
    try {
        const file = await loadStatic(
            endpoints.courseAreaDescription,
            // course area files are the same for every semester
            CURRENT_TERM,
        );

        return reply
            .header("Content-Type", "application/json")
            .header(
                "Cache-Control",
                // we have s shorter s-max-age because we can manually purge
                // those cache
                "public,s-max-age=3600,max-age=1800,stale-while-revalidate=3600,stale-if-error=86400",
            )
            .send(file);
    } catch {
        return reply.status(404).end();
    }
});

courseApp.get("/offering-history/:term", async (request, response) => {
    const parsed = APIv4.TermIdentifierString.safeParse(request.params.term);
    if (!parsed.success) return response.status(404).end();
    const term = APIv4.parseTermIdentifier(parsed.data);
    const lastOffered = await computeOfferingHistory(term);
    return response
        .header("Content-Type", "application/json")
        .header(
            "Cache-Control",
            "public,s-max-age=3600,max-age=1800,stale-while-revalidate=3600,stale-if-error=86400",
        )
        .send(lastOffered);
});

export { courseApp };
