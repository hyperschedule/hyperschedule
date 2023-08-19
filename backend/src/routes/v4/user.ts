import type { Request, Response, NextFunction } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import {
    addSchedule,
    addSection,
    batchAddSectionsToNewSchedule,
    createGuestUser,
    deleteSchedule,
    deleteSection,
    getUser,
    renameSchedule,
    replaceSections,
    setActiveSchedule,
    setSectionAttrs,
} from "../../db/models/user";
import { createLogger } from "../../logger";
import { signUser } from "../../auth/token";
import { json as jsonParser } from "milliparsec";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { getAllSectionId } from "../../db/models/course";
import { CURRENT_TERM } from "../../current-term";

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
    let user: APIv4.User;
    try {
        user = await getUser(request.userToken.uuid);
    } catch (e) {
        logger.error(
            "Cannot find user %s with a valid server signature",
            request.userToken.uuid,
        );
        return response.status(401).cookie("token", "").end();
    }
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
    })
    .patch(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();

        const input = APIv4.SetSectionAttrRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await setSectionAttrs(
            request.userToken.uuid,
            input.data.scheduleId,
            input.data.section,
            input.data.attrs,
        );

        return response.status(204).end();
    });

userApp
    .route("/active-schedule")
    .use(jsonParser()) // we need to add this so it can parse json requests
    .post(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();
        const input = APIv4.SetActiveScheduleRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await setActiveSchedule(request.userToken.uuid, input.data.scheduleId);
        response.status(204).end();
    });

userApp
    .route("/replace-sections")
    .use(jsonParser()) // we need to add this so it can parse json requests
    .post(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();
        const input = APIv4.ReplaceSectionsRequest.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        await replaceSections(
            request.userToken.uuid,
            input.data.scheduleId,
            input.data.sections,
        );
        response.status(204).end();
    });

userApp
    .route("/import-v3-courses")
    .use(jsonParser()) // we need to add this so it can parse json requests
    .post(async function (request: Request, response: Response) {
        if (request.userToken === null) return response.status(401).end();
        const input = APIv4.ImportV3Request.safeParse(request.body);
        if (!input.success)
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(input.error);

        const map: Map<string, APIv4.SectionIdentifier> = new Map(
            (await getAllSectionId(CURRENT_TERM)).map((s) => [
                APIv4.stringifySectionCode(s._id),
                s._id,
            ]),
        );
        const sections: APIv4.UserSection[] = [];
        for (const c of input.data.courses) {
            const section = map.get(c.code);
            if (section === undefined) continue;
            sections.push({ section, attrs: { selected: c.selected } });
        }

        const scheduleId = await batchAddSectionsToNewSchedule(
            request.userToken.uuid,
            sections,
            CURRENT_TERM,
            "Imported Schedule",
        );

        await setActiveSchedule(request.userToken.uuid, scheduleId);

        return response
            .header("Content-Type", "application/json")
            .send({ scheduleId } satisfies APIv4.ImportV3Response);
    });

export { userApp };
