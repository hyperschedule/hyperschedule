import { describe, test, expect } from "@jest/globals";
import { mergeCourseAreaCourses } from "../src/utils";

describe("Backend utils", () => {
    test("mergeCourseAreaCourses", () => {
        const result = mergeCourseAreaCourses([
            {
                area: "A",
                courses: [],
            },
        ]);
        expect(result).toEqual(new Map());
        //
    });
});
