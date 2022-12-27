import { describe, test, expect } from "@jest/globals";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import {
    parseCXCourseCode,
    parseCXSectionIdentifier,
} from "../src/utils/course-code";

describe("parseCXCourseCode", () => {
    test("course with one suffix", () => {
        expect(parseCXCourseCode("MUS 082 LPO")).toEqual({
            department: "MUS",
            courseNumber: 82,
            suffix: "L",
            affiliation: "PO",
        } as APIv4.CourseCode);
    });

    test("course with two suffix", () => {
        expect(parseCXCourseCode("AFRI121IOAF")).toEqual({
            department: "AFRI",
            courseNumber: 121,
            suffix: "IO",
            affiliation: "AF",
        } as APIv4.CourseCode);
    });

    test("course without suffix", () => {
        expect(parseCXCourseCode("ECON196  CM")).toEqual({
            department: "ECON",
            courseNumber: 196,
            suffix: "",
            affiliation: "CM",
        } as APIv4.CourseCode);
    });

    test("course with incorrect space padding", () => {
        expect(parseCXCourseCode("ASAM143 PO")).toEqual({
            department: "ASAM",
            courseNumber: 143,
            suffix: "",
            affiliation: "PO",
        } as APIv4.CourseCode);
    });
});

describe("parseCXSectionIdentifier", () => {
    test("Section with suffix", () => {
        expect(parseCXSectionIdentifier("MUS 042B PO-01 SP2023")).toEqual({
            department: "MUS",
            courseNumber: 42,
            suffix: "B",
            affiliation: "PO",
            sectionNumber: 1,
            term: "SP",
            year: 2023,
            half: "",
        } as APIv4.SectionIdentifier);

        expect(parseCXSectionIdentifier("ASTR101 LPO-01 FA2020")).toEqual({
            department: "ASTR",
            courseNumber: 101,
            suffix: "L",
            affiliation: "PO",
            sectionNumber: 1,
            term: "FA",
            year: 2020,
            half: "",
        } as APIv4.SectionIdentifier);
    });

    test("Section without suffix", () => {
        expect(parseCXSectionIdentifier("MUS 042B PO-01 SP2023")).toEqual({
            department: "MUS",
            courseNumber: 42,
            suffix: "B",
            affiliation: "PO",
            sectionNumber: 1,
            term: "SP",
            year: 2023,
            half: "",
        } as APIv4.SectionIdentifier);

        expect(parseCXSectionIdentifier("ID  001  PO-30 FA2020")).toEqual({
            department: "ID",
            courseNumber: 1,
            suffix: "",
            affiliation: "PO",
            sectionNumber: 30,
            term: "FA",
            year: 2020,
            half: "",
        } as APIv4.SectionIdentifier);
    });

    test("Half semester courses", () => {
        expect(parseCXSectionIdentifier("MCBI118A HM-01 SP2023P1")).toEqual({
            department: "MCBI",
            courseNumber: 118,
            suffix: "A",
            affiliation: "HM",
            sectionNumber: 1,
            term: "SP",
            year: 2023,
            half: "P1",
        } as APIv4.SectionIdentifier);

        expect(parseCXSectionIdentifier("AMST120  HM-01 SU2020S1")).toEqual({
            department: "AMST",
            courseNumber: 120,
            suffix: "",
            affiliation: "HM",
            sectionNumber: 1,
            term: "SU",
            year: 2020,
            half: "S1",
        } as APIv4.SectionIdentifier);

        expect(parseCXSectionIdentifier("HIST197D SC-01 SU2020S5")).toEqual({
            department: "HIST",
            courseNumber: 197,
            suffix: "D",
            affiliation: "SC",
            sectionNumber: 1,
            term: "SU",
            year: 2020,
            half: "S5",
        } as APIv4.SectionIdentifier);
    });
});
