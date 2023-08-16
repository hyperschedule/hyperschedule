import { collections } from "../collections";
import { uuid4 } from "../utils";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";
import { CURRENT_TERM } from "../../current-term";

const logger = createLogger("db.user");

/**
 * Creates an anonymous user and returns the user id
 */
export async function createGuestUser(): Promise<string> {
    const uid = uuid4("u");
    const scheduleId = uuid4("s");
    const user: APIv4.GuestUser = {
        _id: uid,
        isGuest: true,
        schedules: [
            {
                _id: scheduleId,
                isActive: false,
                term: CURRENT_TERM,
                name: "Schedule 1",
                sections: [],
            },
        ],
        lastModified: Math.floor(new Date().getTime() / 1000),
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
): Promise<string> {
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
        schedules: [
            {
                _id: scheduleId,
                isActive: false,
                term: CURRENT_TERM,
                name: "Schedule 1",
                sections: [],
            },
        ],
        lastModified: Math.floor(new Date().getTime() / 1000),
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
    userId: string,
    term: APIv4.TermIdentifier,
    scheduleName: string,
) {
    const user = await getUser(userId);
    logger.info(
        `Adding schedule ${scheduleName} (${APIv4.stringifyTermIdentifier(
            term,
        )}) for user ${userId}`,
    );
    if (user.schedules.length >= 100) {
        logger.warn(`User ${userId} reached schedule limit`);
        throw Error("Schedule limit reached");
    }

    const scheduleId = uuid4("s");

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            schedules: {
                $not: {
                    $size: 100,
                },
            },
        },
        {
            $push: {
                schedules: {
                    _id: scheduleId,
                    isActive: false,
                    term,
                    name: scheduleName,
                    sections: [],
                } satisfies APIv4.UserSchedule,
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
        `Addition of schedule ${scheduleName} (${APIv4.stringifyTermIdentifier(
            term,
        )}) for user ${userId} completed. New schedule ID is ${scheduleId}`,
    );
    return scheduleId;
}

export async function renameSchedule(
    userId: string,
    scheduleId: string,
    newName: string,
) {
    logger.info(
        `Renaming schedule ${scheduleId} for user ${userId} to "${newName}"`,
    );

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            "schedules._id": scheduleId,
        },
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
                "schedules.$.name": newName,
            },
        },
    );

    if (!result.ok || result.value === null) {
        logger.warn(`Operation failed`, result);
        throw Error("Database operation failed");
    }
}

export async function addSection(
    userId: string,
    scheduleId: string,
    section: APIv4.SectionIdentifier,
) {
    const user = await collections.users.findOne({
        _id: userId,
        "schedules._id": scheduleId,
    });
    if (user === null) {
        throw Error("User with this schedule not found");
    }
    logger.info(
        `Adding section ${APIv4.stringifySectionCodeLong(
            section,
        )} to ${scheduleId} for user ${userId}`,
    );

    for (const s of user.schedules) {
        if (s._id === scheduleId) {
            if (s.term.term !== section.term || s.term.year !== section.year) {
                logger.warn(
                    `Operation failed. Section ${APIv4.stringifySectionCodeLong(
                        section,
                    )} is not compatible with schedule ${scheduleId}`,
                );
                throw Error(
                    "Section to be added does not have the same term as the schedule",
                );
            }
            break;
        }
    }

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
            "schedules._id": scheduleId,
        },
        {
            $addToSet: {
                "schedules.$.sections": {
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

export async function deleteSchedule(userId: string, scheduleId: string) {
    const user = await collections.users.findOne({
        _id: userId,
        "schedules._id": scheduleId,
    });
    if (user === null) {
        throw Error("User with this schedule not found");
    }
    logger.info(`Deleting schedule ${scheduleId} for user ${userId}`);

    const result = await collections.users.findOneAndUpdate(
        {
            _id: userId,
        },
        {
            $pull: {
                schedules: {
                    _id: scheduleId,
                },
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
        `Deletion of schedule ${scheduleId} for user ${userId} completed`,
    );
}

export async function deleteSection(
    userId: string,
    scheduleId: string,
    section: APIv4.SectionIdentifier,
) {
    const user = await collections.users.findOne({
        _id: userId,
        "schedules._id": scheduleId,
    });
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
            "schedules._id": scheduleId,
        },
        {
            $set: {
                lastModified: Math.floor(new Date().getTime() / 1000),
            },
            $pull: {
                "schedules.$.sections": { section },
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
    userId: string,
    scheduleId: string,
    sectionId: APIv4.SectionIdentifier,
    attrs: Partial<APIv4.UserSectionAttrs>,
) {
    const user = await collections.users.findOne({
        _id: userId,
        "schedules._id": scheduleId,
    });
    if (user === null) {
        throw Error("User with this schedule not found");
    }

    logger.info(
        `Setting attributes %o of ${APIv4.stringifySectionCodeLong(
            sectionId,
        )} in ${scheduleId} for ${userId}`,
        attrs,
    );

    for (const schedule of user.schedules) {
        if (schedule._id !== scheduleId) continue;

        for (const s of schedule.sections) {
            if (APIv4.compareSectionIdentifier(s.section, sectionId)) {
                s.attrs = { ...s.attrs, ...attrs };
                const result = await collections.users.findOneAndUpdate(
                    {
                        _id: userId,
                        "schedules._id": scheduleId,
                    },
                    {
                        $set: {
                            "schedules.$": schedule,
                            lastModified: Math.floor(
                                new Date().getTime() / 1000,
                            ),
                        },
                    },
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
                return;
            }
        }

        throw Error("No matching section found");
    }
}
