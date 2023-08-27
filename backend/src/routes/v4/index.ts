import { App } from "@tinyhttp/app";
import { courseApp } from "./courses";
import { userApp } from "./user";
import { calendarApp } from "./calendar";
import termApp from "./term";

const v4App = new App({ settings: { xPoweredBy: false } })
    .use(courseApp)
    .use("/term/", termApp)
    .use("/user/", userApp)
    .use("/calendar/", calendarApp);

export { v4App };
