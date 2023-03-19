import { describe, test, expect } from "@jest/globals";

import { parseCourseBoomi, CourseOutput } from "../../src/hmc-api/data-loader";

const BOOMI_DB_SAMPLE = `
DBSTART|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|BEGIN|2|@|OUT_START|3|@|SMPL010A EX|^|Example Class|^|SAFR|^||^|SC|^|Example Description
|#|SMPL127  EX|^|Another Example Class|^|SAFR|^|05.0201|^|PZ|^|Indeed, another example description
|#|SMPL123  EX|^|Class With Not enough fields|^|PZ|^|this one should be skipped
|#|SMPL124  EX|^|Class With too many fields|^|SAFR|^||^|PZ|^|the next field should be ignored|^|junk|^||^|
|#|SMPL191  EX|^|Example Class Boogaloo|^|PAFR|^||^|PO|^|Yeehaw|#||#|OUT_END|3|@|END|2|@|DBEND|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|
`;
const BOOMI_DB_EXPECTED: CourseOutput[] = [
    {
        code: "SMPL010A EX",
        title: "Example Class",
        campus: "SC",
        description: "Example Description\n",
    },
    {
        code: "SMPL127  EX",
        title: "Another Example Class",
        campus: "PZ",
        description: "Indeed, another example description\n",
    },
    // class with not enough fields is skipped
    {
        code: "SMPL124  EX",
        title: "Class With too many fields",
        campus: "PZ",
        description: "the next field should be ignored",
    },
    {
        code: "SMPL191  EX",
        title: "Example Class Boogaloo",
        campus: "PO",
        description: "Yeehaw",
    },
];

describe("boomi parser", () => {
    test("parseBoomiEquivalent", () => {
        const boomi_courses = parseCourseBoomi(BOOMI_DB_SAMPLE);
        expect(boomi_courses).toStrictEqual(BOOMI_DB_EXPECTED);
    });
});
