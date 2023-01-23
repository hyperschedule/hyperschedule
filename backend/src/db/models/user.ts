import { collections } from "../collections";
import { v4 as uuid4 } from "uuid";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { CURRENT_TERM } from "../../current-term";

import { createLogger } from "../../logger";

const logger = createLogger("db.user");

export async function getUser(uuid: string): Promise<APIv4.GenericUser | null> {
    return collections.users.findOne({ _id: uuid });
}

export async function createGuestUser(): Promise<
    APIv4.User<APIv4.GuestUserAuth>
> {
    const uuid = uuid4();
    const user: APIv4.User<APIv4.GuestUserAuth> = {
        _id: uuid,
        activeTerm: CURRENT_TERM,
        schedules: {
            [CURRENT_TERM]: {
                [APIv4.NoFolder]: {
                    name: APIv4.NoFolder,
                    hidden: false,
                    sections: [],
                },
            },
        },
        auth: {
            isGuest: true,
            lastModified: Math.floor(new Date().getTime() / 100),
        },
    };

    const res = await collections.users.insertOne(user);

    if (res.insertedId !== uuid) {
        logger.error(
            `Error inserting guest user into database. Requested ID is ${uuid}, resulted id is ${res.insertedId}`,
        );
        throw Error(`Database error: mismatching insertion id`);
    }

    return user;
}
