import { App } from "@tinyhttp/app";
import { CURRENT_TERM } from "../../current-term";

const app = new App({ settings: { xPoweredBy: false } });

app.get("/current", async (_, response) => {
    response.send(JSON.stringify(CURRENT_TERM));
});

export default app;
