import type { Request, Response, NextFunction } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import {
    addSchedule,
    addSection,
    createGuestUser,
    deleteSchedule,
    deleteSection,
    getUser,
    renameSchedule,
} from "../../db/models/user";
import { createLogger } from "../../logger";
import { signUser } from "../../auth/token";
import { json as jsonParser } from "milliparsec";
import * as APIv4 from "hyperschedule-shared/api/v4";

const logger = createLogger("server.route.user");

const userApp = new App({
    settings: { xPoweredBy: false },
    onError(err: any, req, res) {
        // apparently tinyhttp will throw an object {code: 404} when the route doesn't match anything
        if (Object.hasOwn(err, "code")) return res.status(err.code).end();
        // a lot of database methods can throw errors, and we don't
        // want 500 status
        logger.info("User error: %o", err);
        return res.status(400).send(`${err}`);
    },
}).use((req: Request, res: Response, next: NextFunction) => {
    // middleware to add this header to everything under this app
    res.header("Cache-Control", "no-cache,no-store,max-age=0,must-revalidate");
    res.header("Access-Control-Allow-Credentials", "true");
    // handle preflight requests
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH")
            .status(204)
            .end();
        return;
    }
    next();
});

userApp
    .route("/new-guest")
    .get(async function (request: Request, response: Response) {
        response.status(405).end();
    })
    .post(async function (request: Request, response: Response) {
        if (request.userToken !== null)
            return response
                .status(401)
                .send(`Already authenticated as ${request.userToken.uuid}`);

        logger.trace("[%d] Creating new guest user", request.id);
        const user = await createGuestUser();
        logger.info("[%d] new guest user %s created", request.id, user);

        const cookie = signUser({ uuid: user });
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
    });

userApp.get("/", async function (request: Request, response: Response) {
    if (request.userToken === null) return response.status(401).end();
    let user:APIv4.User;
    try {
        user = await getUser(request.userToken.uuid);
    } catch (e) {
        logger.error("Cannot find user %s with a valid server signature",request.userToken.uuid)
        return response.status(401).cookie("token","").end()
    }
    logger.info(user);
    return response.header("Content-Type", "application/json").send(user);
});

userApp
    .route("/schedule")
    .use(jsonParser()) // we need to add this so it can parse json requests
    .post(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();

        const input = APIv4.AddScheduleRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        const scheduleId = await addSchedule(
            request.userToken.uuid,
            input.data.term,
            input.data.name,
        );

        response
            .header("Content-Type", "application/json")
            .send({ scheduleId } satisfies APIv4.AddScheduleResponse);
    })
    .patch(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();

        const input = APIv4.RenameScheduleRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await renameSchedule(
            request.userToken.uuid,
            input.data.scheduleId,
            input.data.name,
        );
        return response.status(204).end();
    })
    .delete(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();

        const input = APIv4.DeleteScheduleRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await deleteSchedule(request.userToken.uuid, input.data.scheduleId);
        return response.status(204).end();
    });

userApp
    .route("/section")
    .use(jsonParser()) // we need to add this so it can parse json requests
    .post(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();
        const input = APIv4.AddSectionRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await addSection(
            request.userToken.uuid,
            input.data.scheduleId,
            input.data.section,
        );

        return response.status(201).end();
    })
    .delete(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();

        const input = APIv4.DeleteSectionRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await deleteSection(
            request.userToken.uuid,
            input.data.scheduleId,
            input.data.section,
        );

        return response.status(204).end();
    });

export { userApp };
