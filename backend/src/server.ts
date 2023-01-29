import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { v4App } from "./routes/v4";
import { middleware } from "./middleware";

const server = new App({})
    .use(cookieParser())
    .use("", middleware)
    .use("/v4", v4App);

export { server };
