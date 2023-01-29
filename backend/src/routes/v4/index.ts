import { App } from "@tinyhttp/app";
import { courseApp } from "./courses";

const v4App = new App().use(courseApp);

export { v4App };
