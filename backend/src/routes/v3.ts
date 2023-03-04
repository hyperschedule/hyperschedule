import { App } from "@tinyhttp/app";
import type { Request, Response } from "@tinyhttp/app";
import { getAllSections } from "../db/models/course";
import { CURRENT_TERM } from "../current-term";
import { v3CourseListFromV4SectionList } from "../hmc-api/v3convert";

export const v3App = new App({ settings: { xPoweredBy: false } });

v3App.get("/courses", async function (request: Request, response: Response) {
    return response
        .header(
            "Cache-Control",
            "public,s-max-age=30,max-age=60,proxy-revalidate,stale-while-revalidate=30",
        )
        .header("Content-Type", "application/json")
        .send(
            JSON.stringify(
                v3CourseListFromV4SectionList(
                    await getAllSections(CURRENT_TERM),
                ),
            ),
        );
});
