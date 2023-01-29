import type { NextFunction, Request, Response } from "@tinyhttp/app";
import { createLogger } from "./logger";
import { safeVerifyUser } from "./auth/token";

const logger = createLogger("server.request");

let counter = 1;

export function middleware(req: Request, res: Response, next: NextFunction) {
    const reqId = counter++;
    logger.info(
        {
            "user-agent": req.headers["user-agent"],
        },
        "[%d] %s %s",
        reqId,
        req.method,
        req.path,
    );
    req.id = reqId;

    const token: string | undefined = req.cookies.token;

    if (token !== undefined) {
        const u = safeVerifyUser(token);
        if (u.valid) {
            logger.info(
                "[%d] successfully verified user token for %s",
                req.id,
                u.token.uuid,
            );
            req.userToken = u.token;
        } else {
            logger.info("[%d] cannot verify user token: %s", req.id, u.reason);
            logger.trace("[%d] token is '%s'", req.id, token);
            req.userToken = null;
        }
    } else {
        req.userToken = null;
    }

    res.header("Access-Control-Allow-Origin", "*");

    next();
    res.on("finish", () =>
        logger.info("[%d] Completed %d", reqId, res.statusCode, res),
    );
}
