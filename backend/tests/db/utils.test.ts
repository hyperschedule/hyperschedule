import { describe, expect, test } from "vitest";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { dbToSection, sectionToDb } from "../../src/db/utils";
import { testSection } from "./test-data";

describe("db/utils", () => {
    test("Section to db conversion immutable", () => {
        expect(APIv4.Section.safeParse(testSection).success).toBeTruthy();
        const s = sectionToDb(testSection);
        expect(APIv4.Section.safeParse(testSection).success).toBeTruthy();
        expect(APIv4.Section.safeParse(s).success).not.toBeTruthy();
        expect(s).not.toStrictEqual(testSection);
    });

    test("DB to section conversion immutable", () => {
        expect(APIv4.Section.safeParse(testSection).success).toBeTruthy();
        const db = sectionToDb(testSection);
        expect(APIv4.Section.safeParse(testSection).success).toBeTruthy();
        const dbs = JSON.stringify(db);
        expect(dbToSection(db)).toStrictEqual(testSection);
        expect(db).toStrictEqual(JSON.parse(dbs));
    });

    test("DB to section conversion reversible", () => {
        expect(APIv4.Section.safeParse(testSection).success).toBeTruthy();
        expect(dbToSection(sectionToDb(testSection))).toStrictEqual(
            testSection,
        );
    });
});
