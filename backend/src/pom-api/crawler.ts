/* eslint-disable */
import type {
    PomApiCourseAreaCourse,
    PomApiCourseArea,
    PomApiTerm,
    PomApiTermCourse,
} from "./types";
import { mergeApiCourses, mergeCourseAreaCourses } from "./utils";
import { createLogger } from "../logger";
const logger = createLogger("parser.pom.crawler");
const POM_API_ENDPOINT = "https://jicsweb.pomona.edu/api/";

// we have to wait until https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
// is fixed
async function get(uri: string): Promise<{ status: number; res: any }> {
    const res = await fetch(POM_API_ENDPOINT + uri, {
        method: "GET",
        headers: {
            "User-Agent": "HyperscheduleBot",
        },
    });
    logger.debug(`Crawler GET ${uri} ${res.status}`);
    if (res.status !== 200)
        return {
            status: res.status,
            res: {},
        };
    try {
        return {
            status: res.status,
            res: await res.json(),
        };
    } catch (e) {
        console.error(e);
        console.error(await res.text());
        throw Error("Cannot decode response as json");
    }
}

/**
 * Retrieve the most recent term according to API
 */
async function getCurrentTerm(): Promise<string> {
    const terms = await get("Terms");
    if (terms.status !== 200)
        throw Error(`GET Terms returned status ${terms.status}`);
    const term = (terms.res as PomApiTerm[])[0];
    if (term === undefined) {
        throw Error("No term retrieved from Pomona API");
    }
    return term.Key;
}

async function getAllCourseAreas() {
    const courseAreas = await get("CourseAreas");
    if (courseAreas.status !== 200)
        throw Error(`GET Terms returned status ${courseAreas.status}`);
    return courseAreas.res as PomApiCourseArea[];
}

async function getCourseArea(
    termKey: string,
    courseAreaCode: string,
): Promise<PomApiCourseAreaCourse[]> {
    const courses = await get(
        `Courses/${encodeURIComponent(termKey)}/${encodeURIComponent(
            courseAreaCode,
        )}`,
    );
    // one course area has code P/IS and always returns 404 because
    // the server thinks it's a different endpoint
    if (courses.status === 204 || courses.status === 404) return [];
    return courses.res as PomApiCourseAreaCourse[];
}

async function getAllTermCourses(termKey: string): Promise<PomApiTermCourse[]> {
    const courses = await get(`Courses/${termKey}`);
    if (courses.status !== 200) throw Error("No term course found");
    return courses.res as PomApiTermCourse[];
}

async function getAllCourseAreaCourses(termKey: string) {
    const timeStart = new Date().getTime();
    const courseAreas = await getAllCourseAreas();
    let emptyCourseAreas = 0;
    const resolvedPromises = await Promise.all(
        courseAreas.map(async (courseArea) => {
            const courses = await getCourseArea(termKey, courseArea.Code);
            if (courses.length === 0) emptyCourseAreas += 1;
            return { area: courseArea.Code, courses };
        }),
    );
    const timeEnd = new Date().getTime();
    logger.info(
        `${courseAreas.length} course areas fetched in ${
            (timeEnd - timeStart) / 1000
        }s with ${emptyCourseAreas} empty areas`,
    );
    return mergeCourseAreaCourses(resolvedPromises);
}

export async function getAndMergeAllCourses() {
    const termKey = await getCurrentTerm();

    const a = mergeApiCourses(
        ...(await Promise.all([
            getAllTermCourses(termKey),
            getAllCourseAreaCourses(termKey),
        ])),
    );
    logger.info("done");
    return a;
}
