import { App } from "@tinyhttp/app";
import { createLogger } from "./logger";
import type { Request, Response, NextFunction } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { v4App } from "./routes/v4";

const logger = createLogger("server.base");

export interface HSExtendedRequest extends Request {
    id: number;
}

const server = new App().use(cookieParser());
let counter = 1;

server
    .use("", (req: Request, res: Response, next: NextFunction) => {
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
        (req as HSExtendedRequest).id = reqId;
        next();
        res.on("finish", () =>
            logger.info("[%d] Completed %d", reqId, res.statusCode, res),
        );
    })
    .use("/v4", v4App);

export { server };
