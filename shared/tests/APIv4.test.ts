import * as APIv4 from "../api/v4";
import { describe, test } from "@jest/globals";
describe("APIv4 type definition", () => {
    test("course instantiation", () => {
        const course: APIv4.Course = {
            identifier: {
                department: "TEST",
                courseNumber: 1,
                sectionNumber: 0,
                school: "HM", // enum value is fine if we have type assertion
                year: 1970,
                term: APIv4.Term.fall,
            } as APIv4.CourseIdentifier,
            credits: 1,
            description: "test",

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
                    locations: [
                        {
                            buildingName: "TBA",
                            roomName: "TBA",
                            school: APIv4.School.HMC,
                        },
                    ],
                },
            ] as APIv4.Schedule[],
            seatsAvailable: 0,
            seatsTaken: 0,
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
            title: "Intro to unit test",
        };
    });
});
