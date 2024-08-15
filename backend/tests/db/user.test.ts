import { setupDbHooks } from "./hooks";
import { describe, test, expect } from "@jest/globals";
import { collections } from "../../src/db";
import * as APIv4 from "hyperschedule-shared/api/v4";
import {
    addSchedule,
    addSection,
    getUser,
    deleteSchedule,
    deleteSection,
    renameSchedule,
    setSectionAttrs,
    getOrCreateUser,
    updateUser,
    findDuplicatesWith,
    makeAllEPPNLowercase,
    copySchedules,
} from "../../src/db/models/user";

setupDbHooks();

describe("db/models/user", () => {
    test("user creation", async () => {
        const uid = await getOrCreateUser("test user", "");
        expect(await collections.users.findOne({ _id: uid })).toBeTruthy();
        expect(
            (await collections.users.find({}).toArray()).length,
        ).toStrictEqual(1);
    });

    test("add schedule to an user", async () => {
        const uid = await getOrCreateUser("test user", "");
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

        const uid = await await getOrCreateUser("test user", "");

        await deleteSchedule(
            uid,
            Object.keys((await getUser(uid)).schedules)[0]!,
        );
        const uid2 = await await getOrCreateUser("test user 2", "");
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
        const uid = await await getOrCreateUser("test user", "");
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
        const uid = await getOrCreateUser("test user", "");
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
        const uid = await getOrCreateUser("test user", "");
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
        const uid = await getOrCreateUser("test user", "");
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

    test("replace capital letters with lowercase in saml", async () => {
        // Note that if we get an eppn containing capital letters from CAS, we make them lowercase before passing them as arguments to getOrCreateUser.
        // So the users in the db that have capital letters in their eppn are due to legacy code.
        const uid1 = await getOrCreateUser("First Test User", "");
        const uid2 = await getOrCreateUser("Second Test User", "");
        const uid3 = await getOrCreateUser("third test user", "");
        const uid4 = await getOrCreateUser(
            "IniLast2026@hmc.edu",
            "Harvey Mudd College",
        );

        await makeAllEPPNLowercase();

        const user1 = await getUser(uid1);
        const user2 = await getUser(uid2);
        const user4 = await getUser(uid4);
        expect(user1!.eppn).toStrictEqual("first test user");
        expect(user2!.eppn).toStrictEqual("second test user");
        expect(user4!.eppn).toStrictEqual("inilast2026@hmc.edu");
    });

    test("find duplicate users with key", async () => {
        const uid1 = await getOrCreateUser(
            "test user 1",
            "Harvey Mudd College",
        );
        const uid2 = await getOrCreateUser(
            "Test user 1",
            "Claremont McKenna College",
        );
        const uid3 = await getOrCreateUser(
            "test user 2",
            "Claremont McKenna College",
        );
        const uid4 = await getOrCreateUser("Test user 2", "Pomona College");
        const uid5 = await getOrCreateUser("unique user", "Pomona College");

        await makeAllEPPNLowercase();

        const user1 = await getUser(uid1);
        const user2 = await getUser(uid2);
        const user3 = await getUser(uid3);
        const user4 = await getUser(uid4);
        const user5 = await getUser(uid5);

        const duplicatesArray1 = await findDuplicatesWith("eppn");
        expect(duplicatesArray1).toEqual(
            expect.arrayContaining([
                expect.arrayContaining([user1, user2]),
                expect.arrayContaining([user3, user4]),
            ]),
        );

        const duplicatesArray2 = await findDuplicatesWith("school");
        expect(duplicatesArray2).toEqual(
            expect.arrayContaining([
                expect.arrayContaining([user2, user3]),
                expect.arrayContaining([user4, user5]),
            ]),
        );

        const duplicatesArray3 = await findDuplicatesWith("_id");
        expect(duplicatesArray3).toEqual([]);
    });

    test("copy schedule using uid", async () => {
        const uid1 = await getOrCreateUser("test user1", "");
        const uid2 = await getOrCreateUser("test user2", "");

        const user1_pre = await getUser(uid1);
        const user2_pre = await getUser(uid2);
        expect(Object.keys(user1_pre.schedules).length).toStrictEqual(1);
        expect(Object.keys(user2_pre.schedules).length).toStrictEqual(1);

        const sid1 = await addSchedule(
            uid1,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 1",
        );
        const sid2 = await addSchedule(
            uid1,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 2",
        );
        const sid3 = await addSchedule(
            uid2,
            { year: 2023, term: APIv4.Term.spring },
            "test schedule 3",
        );

        await addSection(uid2, sid3, {
            department: "CSCI",
            courseNumber: 131,
            suffix: "",
            affiliation: "HM",
            sectionNumber: 1,
            term: APIv4.Term.spring,
            year: 2023,
            half: null,
        });

        const user1_int = await getUser(uid1);
        const user2_int = await getUser(uid2);
        expect(Object.keys(user1_int.schedules).length).toStrictEqual(3);
        expect(Object.keys(user2_int.schedules).length).toStrictEqual(2);

        await copySchedules(uid2, uid1);
        const user1_post = await getUser(uid1);
        const user2_post = await getUser(uid2);
        expect(Object.keys(user1_post.schedules).length).toStrictEqual(5);
        expect(Object.keys(user2_post.schedules).length).toStrictEqual(2);
    });
});
