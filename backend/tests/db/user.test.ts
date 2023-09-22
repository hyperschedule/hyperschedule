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
    setActiveSchedule,
    deleteGuestUser,
    createOrGetUser,
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

    test("user deletion", async () => {
        const uid = await createGuestUser();
        await expect(getUser(uid)).resolves.toBeTruthy();
        await deleteGuestUser(uid);
        await expect(getUser(uid)).rejects.toBeTruthy();

        // test that non-guest user cannot be deleted
        const loggedInUid = await createOrGetUser(
            "test@hmc.edu",
            "Harvey Mudd",
        );
        await expect(getUser(loggedInUid)).resolves.toBeTruthy();
        await expect(deleteGuestUser(loggedInUid)).rejects.toBeTruthy();
        await expect(getUser(loggedInUid)).resolves.toBeTruthy();
    });

    test("add schedule to an user", async () => {
        const uid = await createGuestUser();
        const user = await getUser(uid);
        expect(Object.keys(user!.schedules).length).toStrictEqual(1);
        const sid = await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 0",
        );
        const updated1 = await getUser(uid);

        expect(updated1.schedules).toStrictEqual({
            ...user.schedules,
            [sid]: {
                term: { year: 2022, term: APIv4.Term.fall },
                name: "test schedule 0",
                sections: [],
            } satisfies APIv4.UserSchedule,
        });

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.spring },
            "test schedule 0",
        );
        const updated2 = await getUser(uid);
        expect(Object.keys(updated2!.schedules).length).toStrictEqual(3);

        await addSchedule(
            uid,
            { year: 2022, term: APIv4.Term.fall },
            "test schedule 1",
        );
        const updated3 = await getUser(uid);
        expect(Object.keys(updated3.schedules).length).toStrictEqual(4);

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
        expect(Object.keys(updated4.schedules).length).toStrictEqual(100);

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

        await deleteSchedule(
            uid,
            Object.keys((await getUser(uid)).schedules)[0]!,
        );
        const uid2 = await createGuestUser();
        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 1",
        );

        await addSection(uid, sid, section);
        const updated1 = await getUser(uid);
        expect(Object.keys(updated1.schedules).length).toStrictEqual(1);
        expect(updated1.schedules[sid]!.sections.length).toStrictEqual(1);
        expect(updated1.schedules[sid]!.sections[0]!.section).toStrictEqual(
            section,
        );

        // if we add the same section again it should ignore the duplicated copy
        await addSection(uid, sid, { ...section });
        const updated2 = await getUser(uid);
        expect(Object.keys(updated2.schedules).length).toStrictEqual(1);
        expect(updated2.schedules[sid]!.sections[0]!.section).toStrictEqual(
            section,
        );

        const newId = {
            ...section,
            half: { number: 6, prefix: "H" },
        };

        await addSection(uid, sid, newId);
        const updated3 = await getUser(uid);
        expect(Object.keys(updated3.schedules).length).toStrictEqual(1);
        expect(updated3.schedules[sid]!.sections.length).toStrictEqual(2);
        expect(updated3.schedules[sid]!.sections[0]!.section).toStrictEqual(
            section,
        );
        expect(updated3.schedules[sid]!.sections[1]!.section).toStrictEqual(
            newId,
        );

        // incompatible schedule and section
        await expect(
            addSection(uid, sid, { ...section, year: 2022 }),
        ).rejects.toBeTruthy();

        const user2 = await getUser(uid2);
        expect(Object.keys(user2.schedules).length).toStrictEqual(1);
    });

    test("delete schedule from user", async () => {
        const uid = await createGuestUser();
        const user = await getUser(uid);
        expect(Object.keys(user.schedules).length).toStrictEqual(1);
        await deleteSchedule(uid, Object.keys(user.schedules)[0]!);
        expect(
            Object.keys((await getUser(uid)).schedules).length,
        ).toStrictEqual(0);

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
        expect(Object.keys(updated1.schedules).length).toStrictEqual(2);

        await deleteSchedule(uid, sid0);
        const updated2 = await getUser(uid);
        expect(Object.keys(updated2.schedules).length).toStrictEqual(1);
        expect(updated2.schedules[sid1]).toStrictEqual({
            term: { year: 2022, term: APIv4.Term.spring },
            name: "test schedule 1",
            sections: [],
        } satisfies APIv4.UserSchedule);

        await deleteSchedule(uid, sid1);
        const updated3 = await getUser(uid);
        expect(Object.keys(updated3!.schedules).length).toStrictEqual(0);
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
        await deleteSchedule(
            uid,
            Object.keys((await getUser(uid)).schedules)[0]!,
        );
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
        expect(updated1.schedules[sid0]!.sections.length).toStrictEqual(2);
        expect(updated1.schedules[sid1]!.sections.length).toStrictEqual(1);
        await deleteSection(uid, sid0, testSection);

        const updated2 = await getUser(uid);
        expect(updated2.schedules[sid0]!.sections.length).toStrictEqual(1);
        expect(updated2.schedules[sid1]!.sections.length).toStrictEqual(1);
        expect(updated2.schedules[sid0]!.sections[0]!.section).toStrictEqual({
            ...testSection,
            courseNumber: 132,
        });
    });

    test("rename schedule", async () => {
        const uid = await createGuestUser();
        await deleteSchedule(
            uid,
            Object.keys((await getUser(uid)).schedules)[0]!,
        );
        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 0",
        );
        await renameSchedule(uid, sid, "test");
        const user = await getUser(uid);
        expect(Object.keys(user.schedules).length).toStrictEqual(1);
        expect(user.schedules[sid]!.name).toStrictEqual("test");
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
        await deleteSchedule(
            uid,
            Object.keys((await getUser(uid)).schedules)[0]!,
        );

        const sid = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 0",
        );
        await addSection(uid, sid, testSection);
        const user = await getUser(uid);
        expect(user.schedules[sid]!.sections[0]!.attrs).toStrictEqual({
            selected: true,
        } satisfies APIv4.UserSectionAttrs);
        await setSectionAttrs(uid, sid, testSection, { selected: false });
        const user2 = await getUser(uid);
        expect(user2.schedules[sid]!.sections[0]!.attrs).toStrictEqual({
            selected: false,
        } satisfies APIv4.UserSectionAttrs);
    });

    test("active schedule logic", async () => {
        const uid = await createGuestUser();
        const user = await getUser(uid);
        const sid = Object.keys(user.schedules)[0]!;
        expect(user.activeSchedule).toStrictEqual(sid);

        await deleteSchedule(uid, sid);
        const updated = await getUser(uid);
        expect(updated.activeSchedule).toStrictEqual(null);

        const sid1 = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 1",
        );
        const updated1 = await getUser(uid);
        expect(updated1.activeSchedule).toStrictEqual(sid1);

        const sid2 = await addSchedule(
            uid,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 2",
        );
        const updated2 = await getUser(uid);
        expect(updated2.activeSchedule).toStrictEqual(sid1);

        await setActiveSchedule(uid, sid2);
        const updated3 = await getUser(uid);
        expect(updated3.activeSchedule).toStrictEqual(sid2);

        // cannot set id for deleted schedules
        await expect(setActiveSchedule(uid, sid)).rejects.toBeTruthy();

        await deleteSchedule(uid, sid2);
        const updated4 = await getUser(uid);
        expect(updated4.activeSchedule).toStrictEqual(sid1);
    });
});
