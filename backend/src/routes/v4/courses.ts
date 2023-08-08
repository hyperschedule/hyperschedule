import * as APIv4 from "hyperschedule-shared/api/v4";
import { getAllSections } from "../../db/models/course";
import { App } from "@tinyhttp/app";
import { courseAreaDescriptions } from "../../hmc-api/course-area-descriptions";
import {CURRENT_TERM} from "../../current-term";

const courseApp = new App({ settings: { xPoweredBy: false } });

courseApp.get("/sections", async function (request, reply) {
    const sections = await getAllSections();
    return reply
        .header("Content-Type", "application/json")
        .header(
            "Cache-Control",
            "public,s-max-age=15,max-age=15,proxy-revalidate,stale-while-revalidate=30",
        )
        .send(JSON.stringify(sections));
});

courseApp.get("/sections/:year/:term", async (request, reply) => {
    const year = parseInt(request.params.year!, 10);
    if (isNaN(year))
        return reply.status(400).send(`Invalid year ${request.params.year}`);

    const term = request.params.term!.toUpperCase();
    const parseTerm = APIv4.TermEnum.safeParse(term);
    if (!parseTerm.success)
        return reply.status(400).send(`Invalid term ${term}`);

    if (year<CURRENT_TERM.year){
        reply.header("Cache-Control",`public,immutable,max-age=${7*24*3600}`)
    } else {
        reply.header("Cache-Control","public,s-max-age=15,max-age=15,proxy-revalidate,stale-while-revalidate=30")
    }
    const sections = await getAllSections({ term: parseTerm.data, year });

    return reply
        .header("Content-Type", "application/json")
        .send(JSON.stringify(sections));
});

courseApp.get("/course-areas", async function (request, reply) {
    // this is only a temporary measure. ideally we will serve out content from the live data stream

    return reply
        .header("Content-Type", "application/json")
        .header(
            "Cache-Control",
            "public,s-max-age=86400,max-age=86400,proxy-revalidate,stale-while-revalidate=3600",
        )
        .send(JSON.stringify(courseAreaDescriptions));
});

export { courseApp };
