import type { Request, Response, NextFunction } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import {
    addSchedule,
    addSection,
    createGuestUser,
    deleteSchedule,
    deleteSection,
    getUser,
} from "../../db/models/user";
import { createLogger } from "../../logger";
import { signUser } from "../../auth/token";
import { json as jsonParser } from "milliparsec";
import * as APIv4 from "hyperschedule-shared/api/v4";

const logger = createLogger("server.route.user");

const userApp = new App({ settings: { xPoweredBy: false } })
    .use(jsonParser()) // we need to add this so it can parse json requests
    .use((req: Request, res: Response, next: NextFunction) => {
        // middleware to add this header to everything under this app
        res.header(
            "Cache-Control",
            "no-cache,no-store,max-age=0,must-revalidate",
        );
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

    const user = await getUser(request.userToken.uuid);
    logger.info(user);
    return response.header("Content-Type", "application/json").send(user);
});

userApp
    .post("/schedule", async function (request: Request, response: Response) {
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
    .post("/section", async function (request: Request, response: Response) {
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
