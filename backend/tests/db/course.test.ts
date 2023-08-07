import { describe, expect, test } from "@jest/globals";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { getAllSections, updateSections } from "../../src/db/models/course";
import { setupDbHooks } from "./hooks";
import { testSectionV4 } from "../test-data";
import { collections } from "../../src/db";

setupDbHooks();

const testTermIdentifier = {
    term: "SP",
    year: 2023,
} as APIv4.TermIdentifier;

describe("db/models/course", () => {
    test("Basic insertion and query", async () => {
        await updateSections([testSectionV4], testTermIdentifier);
        const sections = await getAllSections(testTermIdentifier);
        expect(sections.length).toStrictEqual(1);
        expect(sections[0]).toStrictEqual(testSectionV4);
        expect(
            (await getAllSections({ year: 2022, term: APIv4.Term.spring }))
                .length,
        ).toStrictEqual(0);
    });

    test("updateSections() does not override previous semester", async () => {
        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // fall 2023
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 1,
                        term: APIv4.Term.fall,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.fall, year: 2023 },
        );

        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // spring 2023
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 1,
                        term: APIv4.Term.spring,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.spring, year: 2023 },
        );
        expect(
            (await collections.sections.find({}).toArray()).length,
        ).toStrictEqual(2);
    });

    test("updateSections() replaces everything form the same semester", async () => {
        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // sp section 1
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 1,
                        term: APIv4.Term.spring,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
                {
                    ...testSectionV4,
                    identifier: {
                        // sp section 2
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 2,
                        term: APIv4.Term.spring,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.spring, year: 2023 },
        );

        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // sp section 3
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 3,
                        term: APIv4.Term.spring,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.spring, year: 2023 },
        );
        const sections = await getAllSections({
            term: APIv4.Term.spring,
            year: 2023,
        });
        expect(sections.length).toStrictEqual(1);
        expect(sections[0]).toStrictEqual({
            ...testSectionV4,
            identifier: {
                department: "CSCI",
                courseNumber: 131,
                suffix: "",
                affiliation: "HM",
                sectionNumber: 3,
                term: APIv4.Term.spring,
                year: 2023,
                half: null,
            } satisfies APIv4.SectionIdentifier,
        });
    });
    test("getAllSections() filter works correctly", async () => {
        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // fall 2023
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 1,
                        term: APIv4.Term.fall,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.fall, year: 2023 },
        );

        await updateSections(
            [
                {
                    ...testSectionV4,
                    identifier: {
                        // spring 2023
                        department: "CSCI",
                        courseNumber: 131,
                        suffix: "",
                        affiliation: "HM",
                        sectionNumber: 1,
                        term: APIv4.Term.spring,
                        year: 2023,
                        half: null,
                    } satisfies APIv4.SectionIdentifier,
                },
            ],
            { term: APIv4.Term.spring, year: 2023 },
        );

        expect(
            (await collections.sections.find({}).toArray()).length,
        ).toStrictEqual(2);
        const springSections = await getAllSections({
            term: APIv4.Term.spring,
            year: 2023,
        });
        expect(springSections.length).toStrictEqual(1);
        expect(springSections[0]).toStrictEqual({
            ...testSectionV4,
            identifier: {
                // spring 2023
                department: "CSCI",
                courseNumber: 131,
                suffix: "",
                affiliation: "HM",
                sectionNumber: 1,
                term: APIv4.Term.spring,
                year: 2023,
                half: null,
            } satisfies APIv4.SectionIdentifier,
        });

        const fallSections = await getAllSections({
            term: APIv4.Term.fall,
            year: 2023,
        });
        expect(fallSections.length).toStrictEqual(1);
        expect(fallSections[0]).toStrictEqual({
            ...testSectionV4,
            identifier: {
                // spring 2023
                department: "CSCI",
                courseNumber: 131,
                suffix: "",
                affiliation: "HM",
                sectionNumber: 1,
                term: APIv4.Term.fall,
                year: 2023,
                half: null,
            } satisfies APIv4.SectionIdentifier,
        });
    });
});
