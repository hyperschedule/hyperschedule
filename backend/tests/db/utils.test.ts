import { describe, expect, test } from "@jest/globals";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { dbToSection, sectionToDb } from "../../src/db/utils";
import { testSectionV4 } from "../test-data";

describe("db/utils", () => {
    test("Section to db conversion immutable", () => {
        expect(APIv4.Section.safeParse(testSectionV4).success).toBeTruthy();
        const s = sectionToDb(testSectionV4);
        expect(APIv4.Section.safeParse(testSectionV4).success).toBeTruthy();
        expect(APIv4.Section.safeParse(s).success).not.toBeTruthy();
        expect(s).not.toStrictEqual(testSectionV4);
    });

    test("DB to section conversion immutable", () => {
        expect(APIv4.Section.safeParse(testSectionV4).success).toBeTruthy();
        const db = sectionToDb(testSectionV4);
        expect(APIv4.Section.safeParse(testSectionV4).success).toBeTruthy();
        const dbs = JSON.stringify(db);
        expect(dbToSection(db)).toStrictEqual(testSectionV4);
        expect(db).toStrictEqual(JSON.parse(dbs));
    });

    test("DB to section conversion reversible", () => {
        expect(APIv4.Section.safeParse(testSectionV4).success).toBeTruthy();
        expect(dbToSection(sectionToDb(testSectionV4))).toStrictEqual(
            testSectionV4,
        );
    });
});
