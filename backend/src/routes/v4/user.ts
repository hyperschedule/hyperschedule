import type { Request, Response } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import { createGuestUser } from "../../db/models/user";
import { createLogger } from "../../logger";
import { signUser } from "../../auth/token";

const logger = createLogger("server.route.user");

const userApp = new App();

userApp.post(
    "/new-guest",
    async function (request: Request, response: Response) {
        if (request.userToken !== null)
            return response
                .status(401)
                .send(`Already authenticated as ${request.userToken.uuid}`);

        logger.trace("[%d] Creating new guest user", request.id);
        const user = await createGuestUser();
        logger.info("[%d] new guest user %s created", request.id, user._id);

        const cookie = signUser({ uuid: user._id });
        const expires = new Date();
        expires.setDate(expires.getDate() + 365);

        return response
            .cookie("token", cookie, {
                secure: true,
                sameSite: "strict",
                expires,
            })
            .status(204)
            .end();
    },
);

export { userApp };
