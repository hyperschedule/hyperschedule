import { App } from "@tinyhttp/app";
import { samlApp } from "./saml";

export const authApp = new App({ settings: { xPoweredBy: false } }).use(
    samlApp,
);
