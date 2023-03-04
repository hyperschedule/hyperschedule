import { collections } from "../collections";
import { v4 as uuid4 } from "uuid";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "../../current-term";

import { createLogger } from "../../logger";

const logger = createLogger("db.user");

export async function getUser(uuid: string): Promise<APIv4.User | null> {
    return collections.users.findOne({ _id: uuid });
}

export async function createGuestUser(): Promise<APIv4.GuestUser> {
    const uuid = uuid4();
    const user: APIv4.GuestUser = {
        _id: uuid,
        isGuest: true,
        schedule: {
            activeTerm: APIv4.stringifyTermIdentifier(CURRENT_TERM),
            terms: {
                [APIv4.stringifyTermIdentifier(CURRENT_TERM)]: [],
            },
        },
        lastModified: Math.floor(new Date().getTime() / 1000),
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId.toString() !== uuid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uuid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return user;
}
