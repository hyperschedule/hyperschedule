import * as APIv4 from "../api/v4";
import { describe, test } from "@jest/globals";
describe("APIv4 type definition", () => {
    test("course instantiation", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const course: APIv4.Section = {
            potentialError: false,
            course: {
                title: "Intro to unit test",
                description: "test",
                primaryAssociation: APIv4.School.PTZ,
                code: {
                    department: "TEST",
                    courseNumber: 1,
                    suffix: "",
                    affiliation: "PZ",
                } as APIv4.CourseCode,
            },
            identifier: {
                department: "TEST",
                courseNumber: 1,
                sectionNumber: 0,
                affiliation: "PZ",
                year: 1970,
                term: APIv4.Term.fall,
                suffix: "",
                half: "",
            } as APIv4.SectionIdentifier,
            credits: 1,
            status: "O" as APIv4.SectionStatus,
            // TEST001 PZ-01 is a real class listed on portal in term FA/2022
            // under course area TNDY "Transdisplinary"
            courseAreas: ["TNDY"],
            instructors: [
                {
                    name: "test",
                },
            ],
            notes: "",
            permCount: 0,
            schedules: [
                {
                    startTime: 0,
                    endTime: 3600 * 15,
                    days: [APIv4.Weekday.friday],
                    locations: ["TBA"],
                },
            ] as APIv4.Schedule[],
            seatsFilled: 0,
            seatsTotal: 0,
            startDate: {
                year: 1970,
                month: 1,
                day: 1,
            },
            endDate: {
                year: 1970,
                month: 1,
                day: 1,
            },
        };
    });
});
