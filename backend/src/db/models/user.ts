import { collections } from "../collections";
import { uuid4 } from "../utils";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";
import { CURRENT_TERM } from "../../current-term";
import type { UpdateFilter } from "mongodb";

const logger = createLogger("db.user");

function filterUserWithSchedule(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
) {
    return {
        _id: userId,
        [`schedules.${scheduleId}`]: { $exists: true },
    };
}

/**
 * Creates an anonymous user and returns the user id
 */
export async function createGuestUser(): Promise<APIv4.UserId> {
    const uid = uuid4("u");
    const scheduleId = uuid4("s");
    const user: APIv4.GuestUser = {
        _id: uid,
        isGuest: true,
        schedules: {
            [scheduleId]: {
                term: CURRENT_TERM,
                name: "Schedule 1",
                sections: [],
            },
        },
        lastModified: Math.floor(new Date().getTime() / 1000),
        activeSchedule: scheduleId,
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId.toString() !== uid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return uid;
}

export async function createOrGetUser(
    eppn: string,
    orgName: string,
): Promise<APIv4.UserId> {
    const lookup = await collections.users.findOne({
        eppn,
    });
    if (lookup !== null) {
        logger.info(`Found user ${lookup._id} for ${eppn}`);
        return lookup._id;
    }

    const uid = uuid4("u");
    const scheduleId = uuid4("s");
    let school: APIv4.School = APIv4.School.Unknown;
    switch (orgName) {
        case "Harvey Mudd College":
            school = APIv4.School.HMC;
            break;
        case "Scripps College":
            school = APIv4.School.SCR;
            break;
        case "Pomona College":
            school = APIv4.School.POM;
            break;
        case "Pitzer College":
            school = APIv4.School.POM;
            break;
        case "Claremont McKenna College":
            school = APIv4.School.CMC;
            break;
    }

    const user: APIv4.RegisteredUser = {
        _id: uid,
        isGuest: false,
        schedules: {
            [scheduleId]: {
                term: CURRENT_TERM,
                name: "Schedule 1",
                sections: [],
            },
        },
        lastModified: Math.floor(new Date().getTime() / 1000),
        activeSchedule: scheduleId,
        eppn,
        school,
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId.toString() !== uid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return uid;
}

export async function getUser(userId: string): Promise<APIv4.User> {
    const user = await collections.users.findOne({ _id: userId });
    if (user === null) {
        throw Error("User not found");
    }
    return user;
}

export async function addSchedule(
    userId: APIv4.UserId,
    term: APIv4.TermIdentifier,
    scheduleName: string,
): Promise<APIv4.ScheduleId> {
    const user = await getUser(userId);
    logger.info(
        `Adding schedule ${scheduleName} (${APIv4.stringifyTermIdentifier(
            term,
        )}) for user ${userId}`,
    );

    const scheduleId = uuid4("s");

    const numberOfSchedules = Object.keys(user.schedules).length;
    if (numberOfSchedules >= 100) {
        logger.warn(`User ${userId} reached schedule limit`);
        throw Error("Schedule limit reached");
    }

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            [`schedules.${scheduleId}`]: {
                $exists: false,
            },
        },
        [
            // we need to make this an array so we can use aggregation pipeline methods (namely $cond) in here
            {
                $set: {
                    lastModified: Math.floor(new Date().getTime() / 1000),
                    [`schedules.${scheduleId}`]: {
                        term,
                        name: scheduleName,
                        sections: [],
                    } satisfies APIv4.UserSchedule,
                    activeSchedule: {
                        $cond: {
                            if: { $eq: ["$activeSchedule", null] },
                            then: scheduleId,
                            else: "$activeSchedule",
                        },
                    },
                } as UpdateFilter<APIv4.User>,
            },
        ],
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(
        `Addition of schedule ${scheduleName} (${APIv4.stringifyTermIdentifier(
            term,
        )}) for user ${userId} completed. New schedule ID is ${scheduleId}`,
    );
    return scheduleId;
}

export async function renameSchedule(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
    newName: string,
) {
    logger.info(
        `Renaming schedule ${scheduleId} for user ${userId} to "${newName}"`,
    );

    const result = await collections.users.findOneAndUpdate(
        filterUserWithSchedule(userId, scheduleId),
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                [`schedules.${scheduleId}.name`]: newName,
            },
        } as UpdateFilter<APIv4.User>,
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
}

export async function addSection(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
    section: APIv4.SectionIdentifier,
) {
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );
    if (user === null) {
        throw Error("User with this schedule not found");
    }
    logger.info(
        `Adding section ${APIv4.stringifySectionCodeLong(
            section,
        )} to ${scheduleId} for user ${userId}`,
    );

    const schedule = user.schedules[scheduleId]!;
    if (
        schedule.term.term !== section.term ||
        schedule.term.year !== section.year
    ) {
        logger.warn(
            `Operation failed. Section ${APIv4.stringifySectionCodeLong(
                section,
            )} is not compatible with schedule ${scheduleId}`,
        );
        throw Error(
            "Section to be added does not have the same term as the schedule",
        );
    }

    const result = await collections.users.findOneAndUpdate(
        filterUserWithSchedule(userId, scheduleId),
        {
            $addToSet: {
                [`schedules.${scheduleId}.sections`]: {
                    attrs: { selected: true },
                    section: section,
                } satisfies APIv4.UserSection,
            },
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
            },
        },
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(
        `Addition of section ${APIv4.stringifySectionCodeLong(
            section,
        )} to ${scheduleId} for user ${userId} completed`,
    );
}

export async function deleteSchedule(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
) {
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );

    if (user === null) {
        throw Error("User with this schedule not found");
    }

    const schedules = APIv4.getSchedulesSorted(user.schedules).map(
        ([id]) => id,
    );
    let newActiveSchedule: APIv4.ScheduleId | null = null;
    if (schedules.length > 1) {
        // set active schedule to be the next one down the list. if it is already last one on the list, set it above
        const n = schedules.indexOf(scheduleId);
        if (n === -1) {
            throw Error(
                "Something went horribly wrong. MongoDB says this thing should be here but apparently not",
            );
        } else if (n === schedules.length - 1) {
            newActiveSchedule = schedules[n - 1]!;
        } else {
            newActiveSchedule = schedules[n + 1]!;
        }
    }

    logger.info(`Deleting schedule ${scheduleId} for user ${userId}`);

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
        },
        {
            $unset: {
                [`schedules.${scheduleId}`]: true,
            },
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                activeSchedule: newActiveSchedule,
            },
        },
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(
        `Deletion of schedule ${scheduleId} for user ${userId} completed`,
    );
}

// used by frontend to reorder sections
export async function replaceSections(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
    sections: APIv4.UserSection[],
) {
    logger.info(`Replacing sections for ${userId}`);
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );
    if (user === null) {
        throw Error("User with this schedule not found");
    }
    const result = await collections.users.findOneAndUpdate(
        filterUserWithSchedule(userId, scheduleId),
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                [`schedules.${scheduleId}.sections`]: sections,
            },
        } as UpdateFilter<APIv4.User>,
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(`Replacing sections for ${userId} completed`);
}

export async function batchAddSectionsToNewSchedule(
    userId: APIv4.UserId,
    sections: APIv4.UserSection[],
    term: APIv4.TermIdentifier,
    scheduleName: string,
): Promise<APIv4.ScheduleId> {
    logger.info(`Batch-importing sections for user ${userId}, %o`, sections);
    const scheduleId = uuid4("s");
    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
        },

        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                [`schedules.${scheduleId}`]: {
                    name: scheduleName,
                    term: term,
                    sections,
                } satisfies APIv4.UserSchedule,
            },
        } as UpdateFilter<APIv4.User>,
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(`Batch-importing sections for user ${userId} completed`);
    return scheduleId;
}

export async function deleteSection(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
    section: APIv4.SectionIdentifier,
) {
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );
    if (user === null) {
        throw Error("User with this schedule not found");
    }

    logger.info(
        `Deleting ${APIv4.stringifySectionCodeLong(
            section,
        )} from schedule ${scheduleId} for user ${userId}`,
    );

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            [`schedules.${scheduleId}.sections`]: { $elemMatch: { section } },
        },
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
            },
            $pull: {
                [`schedules.${scheduleId}.sections`]: { section },
            },
        },
    );
    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(
        `Deletion of ${APIv4.stringifySectionCodeLong(
            section,
        )} from schedule ${scheduleId} for user ${userId} completed`,
    );
}

export async function setSectionAttrs(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
    sectionId: APIv4.SectionIdentifier,
    attrs: Partial<APIv4.UserSectionAttrs>,
) {
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );
    if (user === null) {
        throw Error("User with this schedule not found");
    }

    logger.info(
        `Setting attributes %o of ${APIv4.stringifySectionCodeLong(
            sectionId,
        )} in ${scheduleId} for ${userId}`,
        attrs,
    );

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            [`schedules.${scheduleId}.sections`]: {
                $elemMatch: {
                    section: sectionId,
                },
            },
        },
        {
            $set: {
                [`schedules.${scheduleId}.sections.$.attrs`]: attrs,
                lastModified: Math.floor(new Date().getTime() / 1000),
            },
        } as UpdateFilter<APIv4.User>,
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
    logger.info(
        `Setting attributes %o of ${APIv4.stringifySectionCodeLong(
            sectionId,
        )} in ${scheduleId} for ${userId} completed`,
        attrs,
    );
}

export async function setActiveSchedule(
    userId: APIv4.UserId,
    scheduleId: APIv4.ScheduleId,
) {
    const user = await collections.users.findOne(
        filterUserWithSchedule(userId, scheduleId),
    );
    if (user === null) {
        throw Error("User with this schedule not found");
    }

    const result = await collections.users.findOneAndUpdate(
        filterUserWithSchedule(userId, scheduleId),
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                activeSchedule: scheduleId,
            },
        },
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
}
