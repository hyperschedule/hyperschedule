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
    renameSchedule,
    setSectionAttrs,
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
        const user = await getUser(uid);
        expect(user!.schedules.length).toStrictEqual(1);
        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 0",
        );
        const updated1 = await getUser(uid);
        expect(updated1!.schedules.length).toStrictEqual(2);

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.spring },
            "test schedule 0",
        );
        const updated2 = await getUser(uid);
        expect(updated2!.schedules.length).toStrictEqual(3);

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 1",
        );
        const updated3 = await getUser(uid);
        expect(updated3.schedules.length).toStrictEqual(4);

        // add another 96 schedules. use promise.all to test possible race conditions
        await expect(
            Promise.all(
                [...Array(96)].map((_, i) =>
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
        await deleteSchedule(uid, (await getUser(uid)).schedules[0]!._id);
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
        expect(user2.schedules.length).toStrictEqual(1);
    });

    test("delete schedule from user", async () => {
        const uid = await createGuestUser();
        const user = await getUser(uid);
        expect(user.schedules.length).toStrictEqual(1);
        await deleteSchedule(uid, user.schedules[0]!._id);
        expect((await getUser(uid)).schedules.length).toStrictEqual(0);

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
        await deleteSchedule(uid, (await getUser(uid)).schedules[0]!._id);
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

    test("rename schedule", async () => {
        const uid = await createGuestUser();
        await deleteSchedule(uid, (await getUser(uid)).schedules[0]!._id);
        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 0",
        );
        await renameSchedule(uid, sid, "test");
        const user = await getUser(uid);
        expect(user.schedules.length).toStrictEqual(1);
        expect(user.schedules[0]!.name).toStrictEqual("test");
        await expect(
            renameSchedule(uid + "AAAA", sid, "test"),
        ).rejects.toBeTruthy();
        await expect(
            renameSchedule(uid, sid + "AAAA", "test"),
        ).rejects.toBeTruthy();
    });

    test("set section attrs", async () => {
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
        // delete the default schedule
        await deleteSchedule(uid, (await getUser(uid)).schedules[0]!._id);

        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 0",
        );
        await addSection(uid, sid, testSection);
        const user = await getUser(uid);
        expect(user.schedules[0]!.sections[0]!.attrs).toStrictEqual({
            selected: true,
        } satisfies APIv4.UserSectionAttrs);
        await setSectionAttrs(uid, sid, testSection, { selected: false });
        const user2 = await getUser(uid);
        expect(user2.schedules[0]!.sections[0]!.attrs).toStrictEqual({
            selected: false,
        } satisfies APIv4.UserSectionAttrs);
    });
});
