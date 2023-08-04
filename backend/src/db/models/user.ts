import { collections } from "../collections";
import { v4 as uuid4 } from "uuid";
import * as APIv4 from "hyperschedule-shared/api/v4";

import { createLogger } from "../../logger";

const logger = createLogger("db.user");

/**
 * Creates an anonymous user and returns the user id
 */
export async function createGuestUser(): Promise<string> {
    const uuid = uuid4();
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
    const uuid = uuid4();
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
    term: APIv4.TermIdentifierString,
    scheduleName: string,
) {
    const user = await getUser(userId);
    if (user.schedules.length >= 100) {
        throw Error("Schedule limit reached");
    }
    if (
        user.schedules.filter((s) => s.name === scheduleName && s.term === term)
            .length > 0
    ) {
        throw Error("Schedule with this name and term already exists");
    }

    const scheduleId = uuid4();

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
        throw Error("Database operation failed");
    }
    return scheduleId;
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

    for (const s of user.schedules) {
        if (s._id === scheduleId) {
            const term = APIv4.parseTermIdentifier(s.term);
            if (term.term !== section.term || term.year !== section.year)
                throw Error(
                    "Section to be added does not have the same term as the schedule",
                );
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
        throw Error("Database operation failed");
    }
}

export async function deleteSchedule(userId: string, scheduleId: string) {
    const user = await collections.users.findOne({
        _id: userId,
        "schedules._id": scheduleId,
    });
    if (user === null) {
        throw Error("User with this schedule not found");
    }

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
        throw Error("Database operation failed");
    }
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
        throw Error("Database operation failed");
    }
}
