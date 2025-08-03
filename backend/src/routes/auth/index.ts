import { App } from "@tinyhttp/app";
import { samlApp } from "./saml";
import { getOrCreateUser } from "../../db/models/user";
import { signUser } from "../../auth/token";
import { AUTH_TOKEN_COOKIE_NAME } from "hyperschedule-shared/api/constants";
import { COOKIE_DOMAIN } from "../cookie-domain";

export const authApp = new App({ settings: { xPoweredBy: false } }).use(
    samlApp,
);

if (process.env.NODE_ENV === "development") {
    const devUserApp = new App({ settings: { xPoweredBy: false } });
    devUserApp.get("/dev-user", async function (request, response) {
        const user = await getOrCreateUser("test_user", "Harvey Mudd College");

        const sig = signUser({ uuid: user });
        const expires = new Date();
        expires.setDate(expires.getDate() + 365);

        return response
            .cookie(AUTH_TOKEN_COOKIE_NAME, sig, {
                domain: COOKIE_DOMAIN,
                secure: true,
                sameSite: "strict", // needed for redirect
                expires,
            })
            .status(302)
            .location("http://localhost:5000/")
            .end();
    });

    authApp.use(devUserApp);
}
