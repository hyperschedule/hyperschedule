import { collections } from "../collections";
import { uuid4 } from "../utils";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";

const logger = createLogger("db.user");

/**
 * Creates an anonymous user and returns the user id
 */
export async function createGuestUser(): Promise<string> {
    const uuid = uuid4("u");
    const user: APIv4.GuestUser = {
        _id: uuid,
        isGuest: true,
        schedules: [],
        lastModified: Math.floor(new Date().getTime() / 1000),
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId.toString() !== uuid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uuid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return uuid;
}

export async function createUser(eppn: string): Promise<string> {
    const uuid = uuid4("u");
    const user: APIv4.RegisteredUser = {
        _id: uuid,
        isGuest: false,
        schedules: [],
        lastModified: Math.floor(new Date().getTime() / 1000),
        eppn,
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId.toString() !== uuid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uuid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return uuid;
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
    if (
        user.schedules.filter(
            (s) =>
                s.name === scheduleName &&
                s.term.term === term.term &&
                s.term.year === term.year,
        ).length > 0
    ) {
        throw Error("Schedule with this name and term already exists");
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
