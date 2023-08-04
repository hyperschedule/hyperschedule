import { setupDbHooks } from "./hooks";
import { describe, test, expect } from "@jest/globals";
import { collections } from "../../src/db";
import * as APIv4 from "hyperschedule-shared/api/v4";
import {
    createGuestUser,
    addSchedule,
    addSection,
    getUser,
    deleteSchedule,
    deleteSection,
} from "../../src/db/models/user";

setupDbHooks();

describe("db/models/user", () => {
    test("user creation", async () => {
        const uid = await createGuestUser();
        expect(await collections.users.findOne({ _id: uid })).toBeTruthy();
        expect(
            (await collections.users.find({}).toArray()).length,
        ).toStrictEqual(1);
    });

    test("add schedule to an user", async () => {
        const uid = await createGuestUser();
        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 0",
        );
        const updated1 = await getUser(uid);
        expect(updated1!.schedules.length).toStrictEqual(1);

        await expect(
            addSchedule(
                uid,
                { year: 2022, term: APIv4.Term.fall },
                "test schedule 0",
            ),
        ).rejects.toBeTruthy();

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.spring },
            "test schedule 0",
        );
        const updated2 = await getUser(uid);
        expect(updated2!.schedules.length).toStrictEqual(2);

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 1",
        );
        const updated3 = await getUser(uid);
        expect(updated3.schedules.length).toStrictEqual(3);

        // add another 97 schedules. use promise.all to test possible race conditions
        await expect(
            Promise.all(
                [...Array(97)].map((_, i) =>
                    addSchedule(
                        uid,
                        { year: 2022, term: APIv4.Term.fall },
                        `test schedule ${i + 2}`,
                    ),
                ),
            ),
        ).resolves.toBeTruthy();

        const updated4 = await getUser(uid);
        expect(updated4.schedules.length).toStrictEqual(100);

        await expect(
            addSchedule(
                uid,
                { year: 2022, term: APIv4.Term.fall },
                "test schedule 100",
            ),
        ).rejects.toBeTruthy();
    });

    test("add section to an user", async () => {
        const section: APIv4.SectionIdentifier = {
            department: "CSCI",
            courseNumber: 131,
            suffix: "",
            affiliation: "HM",
            sectionNumber: 1,
            term: APIv4.Term.spring,
            year: 2023,
            half: null,
        };

        const uid = await createGuestUser();
        const uid2 = await createGuestUser();
        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 1",
        );

        await addSection(uid, sid, section);
        const updated1 = await getUser(uid);
        expect(updated1.schedules.length).toStrictEqual(1);
        expect(updated1.schedules[0]!.sections.length).toStrictEqual(1);
        expect(updated1.schedules[0]!.sections[0]!.section).toStrictEqual(
            section,
        );

        // if we add the same section again it should ignore the duplicated copy
        await addSection(uid, sid, { ...section });
        const updated2 = await getUser(uid);
        expect(updated2.schedules.length).toStrictEqual(1);
        expect(updated2.schedules[0]!.sections.length).toStrictEqual(1);
        expect(updated2.schedules[0]!.sections[0]!.section).toStrictEqual(
            section,
        );

        const newId = {
            ...section,
            half: { number: 6, prefix: "H" },
        };

        await addSection(uid, sid, newId);
        const updated3 = await getUser(uid);
        expect(updated3.schedules.length).toStrictEqual(1);
        expect(updated3.schedules[0]!.sections.length).toStrictEqual(2);
        expect(updated3.schedules[0]!.sections[0]!.section).toStrictEqual(
            section,
        );
        expect(updated3.schedules[0]!.sections[1]!.section).toStrictEqual(
            newId,
        );

        // incompatible schedule and section
        await expect(
            addSection(uid, sid, { ...section, year: 2022 }),
        ).rejects.toBeTruthy();

        const user2 = await getUser(uid2);
        expect(user2.schedules.length).toStrictEqual(0);
    });

    test("delete schedule from user", async () => {
        const uid = await createGuestUser();
        const sid0 = await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 0",
        );
        const sid1 = await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.spring },
            "test schedule 1",
        );
        const updated1 = await getUser(uid);
        expect(updated1.schedules.length).toStrictEqual(2);

        await deleteSchedule(uid, sid0);
        const updated2 = await getUser(uid);
        expect(updated2.schedules.length).toStrictEqual(1);
        expect(updated2.schedules[0]).toStrictEqual({
            _id: sid1,
            isActive: false,
            term: { year: 2022, term: APIv4.Term.spring },
            name: "test schedule 1",
            sections: [],
        } satisfies APIv4.UserSchedule);

        await deleteSchedule(uid, sid1);
        const updated3 = await getUser(uid);
        expect(updated3!.schedules.length).toStrictEqual(0);
    });

    test("delete section from schedule", async () => {
        const testSection: APIv4.SectionIdentifier = {
            department: "CSCI",
            courseNumber: 131,
            suffix: "",
            affiliation: "HM",
            sectionNumber: 1,
            term: APIv4.Term.spring,
            year: 2023,
            half: null,
        };
        const uid = await createGuestUser();
        const sid0 = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 0",
        );
        const sid1 = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 1",
        );

        await addSection(uid, sid0, testSection);
        await addSection(uid, sid1, testSection);
        await addSection(uid, sid0, { ...testSection, courseNumber: 132 });
        const updated1 = await getUser(uid);
        expect(updated1.schedules[0]!.sections.length).toStrictEqual(2);
        expect(updated1.schedules[1]!.sections.length).toStrictEqual(1);
        await deleteSection(uid, sid0, testSection);

        const updated2 = await getUser(uid);
        expect(updated2.schedules[0]!.sections.length).toStrictEqual(1);
        expect(updated2.schedules[1]!.sections.length).toStrictEqual(1);
        expect(updated2.schedules[0]!.sections[0]!.section).toStrictEqual({
            ...testSection,
            courseNumber: 132,
        });
    });
});
