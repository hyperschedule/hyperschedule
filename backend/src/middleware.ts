import type { NextFunction, Request, Response } from "@tinyhttp/app";
import { createLogger } from "./logger";
import { safeVerifyUser } from "./auth/token";
import * as process from "process";
import { AUTH_TOKEN_COOKIE_NAME } from "hyperschedule-shared/api/constants";

const logger = createLogger("server.request");

let counter = 1;

export function middleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const reqId = counter++;
    logger.info(
        {
            // filter out things like sec-ch-ua and sec-fetch-dest
            ...Object.fromEntries(
                Object.entries(req.headers).filter(
                    (a) =>
                        !a[0].toLowerCase().startsWith("sec") &&
                        a[0] !== "module", // idk in case someone tries to hijack our logger?
                ),
            ),
        },
        "[%d] %s %s",
        reqId,
        req.method,
        req.path,
    );
    req.id = reqId;

    const token: string | undefined = req.cookies[AUTH_TOKEN_COOKIE_NAME];

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

    // process and set appropriate CORS header
    // ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    const origin = req.headers.origin;
    if (origin === undefined || origin === "null") {
        // same origin request, do nothing
    } else {
        const parsed = new URL(origin);
        switch (parsed.hostname) {
            case "localhost":
            case "127.0.0.1":
                if (process.env.NODE_ENV !== "production")
                    res.header("Access-Control-Allow-Origin", parsed.origin);
                break;
            case "hyperschedule.io":
            case "www.hyperschedule.io":
            case "beta.hyperschedule.io":
            case "hyperschedule.github.io":
                res.header("Access-Control-Allow-Origin", parsed.origin);
                res.header("Vary", "Origin");
                break;
        }
    }

    next();
    res.on("close", () =>
        logger.info(
            { ...res.getHeaders() },
            "[%d] Completed %d",
            reqId,
            res.statusCode,
            res,
        ),
    );
}
