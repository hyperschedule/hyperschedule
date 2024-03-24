import { sp, idp } from "../../auth/saml/service-provider";
import { App } from "@tinyhttp/app";
import { urlencoded as bodyParser } from "milliparsec";
import { createLogger } from "../../logger";
import { z } from "zod";
import { getOrCreateUser } from "../../db/models/user";
import { signUser } from "../../auth/token";
import { AUTH_TOKEN_COOKIE_NAME } from "hyperschedule-shared/api/constants";
import { COOKIE_DOMAIN } from "../cookie-domain";

const EPPN_URN = "urn:oid:1.3.6.1.4.1.5923.1.1.1.6";

const logger = createLogger("routes.auth.saml");

const samlApp = new App({ settings: { xPoweredBy: false } });

const SamlResponseFormat = z
    .object({
        audience: z.literal("https://hyperschedule.io/"),
        attributes: z.object({
            eppn: z.string().email().optional(),
            [EPPN_URN]: z.string().email().optional(),
            orgName: z.string(),
            displayName: z.string().optional(),
        }),
    })
    .refine(
        (o) =>
            o.attributes.eppn !== undefined ||
            o.attributes[EPPN_URN] !== undefined,
        { message: "eduPersonPrincipleName is not supplied" },
    );
type SamlResponseFormat = z.infer<typeof SamlResponseFormat>;

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
            const data = SamlResponseFormat.safeParse(result.extract);
            if (!data.success) {
                logger.error(
                    "Cannot parse SAML response from CAS. %o. Error: %o",
                    result.extract,
                    data.error,
                );
                return response
                    .status(400)
                    .header("Content-Type", "text/plain")
                    .send(
                        "Cannot interpret response from CAS. Can you log into Sakai or the library website?\n\n" +
                            `If not, CAS broke. Otherwise, please file a bug report with this error ID: ${result.extract.response?.id}.\n\n` +
                            "(Fun fact, portal doesn't go through CAS. Other school services that go through CAS include\n" +
                            "the Claremont cash website, campus safety vehicle registration website, and Workday)",
                    );
            }

            const user = await getOrCreateUser(
                (data.data.attributes.eppn ?? data.data.attributes[EPPN_URN])!,
                data.data.attributes.orgName,
            );

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
                .location(
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:5000/"
                        : "https://hyperschedule.io/",
                )
                .end();
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
