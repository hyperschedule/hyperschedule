import { App } from "@tinyhttp/app";
import type { Request, Response } from "@tinyhttp/app";
import { getAllSections } from "../db/models/course";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import { v3CourseListFromV4SectionList } from "../hmc-api/v3convert";
import { createLogger } from "../logger";

const logger = createLogger("server.route.v3");

export const v3App = new App({ settings: { xPoweredBy: false } });

v3App.get("/courses", async function (request: Request, response: Response) {
    logger.trace("Getting all sections");
    const sections = await getAllSections(CURRENT_TERM);
    logger.trace("All sections retrieved");
    const v3Courses = JSON.stringify(v3CourseListFromV4SectionList(sections));
    logger.trace("v3 conversion completed, sending response");
    return response
        .header(
            "Cache-Control",
            "public,s-max-age=15,max-age=5,proxy-revalidate,stale-while-revalidate=30",
        )
        .header("Content-Type", "application/json")
        .send(v3Courses);
});
