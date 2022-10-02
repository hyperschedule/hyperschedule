import type { PomApiCourse, PomApiCourseArea, PomApiTerm } from "./pomApiTypes";
import { mergeArrays } from "./utils";

const POM_API_ENDPOINT = "https://jicsweb.pomona.edu/api/";

// we have to wait until https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
// is fixed
/*
eslint-disable
@typescript-eslint/no-unsafe-member-access,
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-argument,
@typescript-eslint/no-unsafe-call,
@typescript-eslint/no-unsafe-return
*/
async function get(uri: string): Promise<{ status: number; res: any }> {
    const res = await fetch(POM_API_ENDPOINT + uri, {
        method: "GET",
        headers: {
            "User-Agent": "HyperscheduleBot",
        },
    });
    console.debug(`Crawler GET ${uri} ${res.status}`);
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

/* eslint-enable */

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

async function getAllCoureseAreas() {
    const courseAreas = await get("CourseAreas");
    if (courseAreas.status !== 200)
        throw Error(`GET Terms returned status ${courseAreas.status}`);
    return courseAreas.res as PomApiCourseArea[];
}

async function getCourseArea(
    termKey: string,
    courseAreaCode: string,
): Promise<PomApiCourse[]> {
    const courses = await get(
        `Courses/${encodeURIComponent(termKey)}/${encodeURIComponent(
            courseAreaCode,
        )}`,
    );
    // one course area has code P/IS and always returns 404 because
    // the server thinks it's a different endpoint
    if (courses.status === 204 || courses.status === 404) return [];
    return courses.res as PomApiCourse[];
}

export async function getAllCourses() {
    const timeStart = new Date().getTime();
    const termKey = await getCurrentTerm();
    const courseAreas = await getAllCoureseAreas();
    let emptyCourseAreas = 0;
    const resolvedPromises = await Promise.all(
        courseAreas.map(async (courseArea) => {
            const courses = await getCourseArea(termKey, courseArea.Code);
            if (courses.length === 0) emptyCourseAreas += 1;
            return courses;
        }),
    );
    const courses = mergeArrays(resolvedPromises);
    const timeEnd = new Date().getTime();
    console.log(
        `${courses.length} sections fetched in ${
            (timeEnd - timeStart) / 1000
        }s across ${
            courseAreas.length
        } course areas with ${emptyCourseAreas} empty course areas`,
    );
}
