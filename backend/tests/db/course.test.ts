import { describe, expect, test } from "vitest";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { getAllSections, updateSections } from "../../src/db/models/course";
import { setupDbHooks } from "./hooks";
import { testSection } from "./test-data";

setupDbHooks();

const testTermIdentifier = {
    term: "SP",
    year: 2023,
} as APIv4.TermIdentifier;

describe("db/models/course", () => {
    test("Basic insertion and query", async () => {
        await updateSections([testSection], testTermIdentifier);
        const sections = await getAllSections();
        expect(sections.length).toStrictEqual(1);
        expect(sections[0]).toStrictEqual(testSection);
        expect(
            (await getAllSections({ year: 2022, term: APIv4.Term.spring }))
                .length,
        ).toStrictEqual(0);
    });

    test("updateSections() does not override previous semester", async () => {
        await updateSections(
            [
                {
                    ...testSection,
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
                    ...testSection,
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
        const sections = await getAllSections();
        expect(sections.length).toStrictEqual(2);
    });

    test("updateSections() replaces everything form the same semester", async () => {
        await updateSections(
            [
                {
                    ...testSection,
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
                    ...testSection,
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
                    ...testSection,
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
        const sections = await getAllSections();
        expect(sections.length).toStrictEqual(1);
        expect(sections[0]).toStrictEqual({
            ...testSection,
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
                    ...testSection,
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
                    ...testSection,
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

        expect((await getAllSections()).length).toStrictEqual(2);
        const springSections = await getAllSections({
            term: APIv4.Term.spring,
            year: 2023,
        });
        expect(springSections.length).toStrictEqual(1);
        expect(springSections[0]).toStrictEqual({
            ...testSection,
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
            ...testSection,
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
