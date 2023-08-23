import { App } from "@tinyhttp/app";
import { CURRENT_TERM } from "../../current-term";
import { computeAllTerms } from "../../db/models/course";

const app = new App({ settings: { xPoweredBy: false } });

app.get("/current", async (_, response) => {
    response.header("Cache-Control", "public,max-age=600").send(CURRENT_TERM);
}).get("/all", async (_, response) => {
    const terms = await computeAllTerms();
    response.header("Cache-Control", "public,max-age=600").send(terms);
});

export default app;
