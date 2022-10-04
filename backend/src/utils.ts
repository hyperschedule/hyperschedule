import type * as APIv4 from "hyperschedule-shared/api/v4";
import type {
    CourseWithAreas,
    MergedPomApiCourse,
    PomApiCourseAreaCourse,
    PomApiTermCourse,
} from "./pomApiTypes";

/**
 * Merges the result of retrieving all course areas
 * to courses as there are a lot of duplicates
 */
export function mergeCourseAreaCourses(
    arr: {
        area: string;
        courses: PomApiCourseAreaCourse[];
    }[],
): Map<string, CourseWithAreas> {
    const map = new Map<string, CourseWithAreas>();
    for (let a of arr) {
        for (let course of a.courses) {
            let mapCourse = map.get(course.CourseCode);
            if (mapCourse === undefined)
                map.set(course.CourseCode, {
                    ...course,
                    courseAreas: [a.area],
                });
            else mapCourse.courseAreas.push(a.area);
        }
    }
    return map;
}

export function mergeApiCourses(
    termCourses: PomApiTermCourse[],
    coursesWithAreas: Map<string, CourseWithAreas>,
): MergedPomApiCourse[] {
    const res: MergedPomApiCourse[] = [];
    for (const ct of termCourses) {
        const ca = coursesWithAreas.get(ct.CourseCode);
        if (ca === undefined) {
            console.error(`"${ct.CourseCode}" not found in course areas`);
            continue;
        }
        // delete it to make sure we don't have duplicate term course
        coursesWithAreas.delete(ct.CourseCode);
        let permCount: number = 0;
        if (ct.PermCount !== null) permCount = parseInt(ct.PermCount);

        // we don't perform NaN check here because there is nothing we can do
        // about bad data
        const [seatsFilled, seatsTotal]: [number, number] = [
            parseInt(ct.SeatsFilled),
            parseInt(ct.SeatsTotal),
        ];

        res.push({
            ...ca,
            PermCount: permCount,
            SeatsFilled: seatsFilled,
            SeatsTotal: seatsTotal,
        });
    }
    if (coursesWithAreas.size !== 0) {
        console.warn(`Courses found without corresponding counts`);
        for (const c of coursesWithAreas.values()) {
            res.push({
                ...c,
                PermCount: NaN,
                SeatsFilled: NaN,
                SeatsTotal: NaN,
            });
        }
    }
    return res;
}

// function pomCourse2v4Course(c: PomApiCourseAreaCourse): APIv4.Course {
//     const course: APIv4.Course = {
//         courseAreas: [],
//         credits: 0,
//         description: "",
//         endDate: undefined,
//         identifier: undefined,
//         instructors: [],
//         notes: "",
//         permCount: 0,
//         schedules: [],
//         seatsAvailable: 0,
//         seatsTaken: 0,
//         seatsTotal: 0,
//         startDate: undefined,
//         title: "",
//     };
// }
//
// export function mergeCourseArrays(
//     c: PomApiCourseAreaCourse[],
// ): APIv4.Course[] {}
