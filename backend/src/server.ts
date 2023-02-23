import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { v4App } from "./routes/v4";
import { v3App } from "./routes/v3";
import { authApp } from "./routes/auth";
import { middleware } from "./middleware";

const server = new App({ settings: { xPoweredBy: false } })
    .use(cookieParser())
    .use("", middleware)
    .use("/v4", v4App)
    .use("/v3", v3App)
    .use("/auth", authApp);

export { server };
