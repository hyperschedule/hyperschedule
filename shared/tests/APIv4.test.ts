import * as APIv4 from "../api/v4";
import { describe, test, expect } from "@jest/globals";
import * as console from "console";
describe("APIv4 type definition", () => {
    test("course instantiation", () => {
        const section: APIv4.Section = {
            potentialError: false,
            course: {
                title: "Intro to unit test",
                potentialError: false,
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
                sectionNumber: 1,
                affiliation: "PZ",
                year: 2015,
                term: APIv4.Term.fall,
                suffix: "",
                half: {
                    prefix: "Z",
                    number: 5,
                },
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
                year: 2015,
                month: 1,
                day: 1,
            },
            endDate: {
                year: 2015,
                month: 1,
                day: 1,
            },
        };
        APIv4.Section.parse(section);
    });
});
