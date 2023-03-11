import { sp, idp } from "../../auth/saml/service-provider";
import { App } from "@tinyhttp/app";
import { urlencoded as bodyParser } from "milliparsec";
import { createLogger } from "../../logger";

const logger = createLogger("routes.auth.saml");

const samlApp = new App({ settings: { xPoweredBy: false } });

// this path is hard coded into the metadata sent to TCCS. Do not change
samlApp
    .use("/saml", bodyParser())
    .use("/saml", function (_, response, next) {
        response.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate, max-age=0",
        );
        next();
    })
    .post("/saml", async function (request, response) {
        try {
            const result = await sp.parseLoginResponse(idp, "post", {
                body: request.body,
            });
            logger.info(result.extract, "SAML request completed");
            return response.send(result.extract);
        } catch (e) {
            logger.error(e);
            return response
                .status(400)
                .setHeader("Content-Type", "text/plain")
                .send(`${e}`);
        }
    })
    .get("/saml", async function (request, response) {
        return response.redirect(
            sp.createLoginRequest(idp, "redirect").context,
        );
    });

export { samlApp };
