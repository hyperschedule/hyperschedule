import { App } from "@tinyhttp/app";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import { computeAllTerms } from "../../db/models/course";

const app = new App({ settings: { xPoweredBy: false } });

app.get("/current", async (_, response) => {
    response.header("Cache-Control", "public,max-age=600").send(CURRENT_TERM);
}).get("/all", async (_, response) => {
    const terms = await computeAllTerms();
    response
        .header(
            "Cache-Control",
            // we set a very long s-max-age here because CDN cache can be manually purged.
            // valid for one week if error
            "public,s-max-age=86400,max-age=600,stale-while-revalidate=86400,stale-if-error=604800",
        )
        .send(terms);
});

export default app;
