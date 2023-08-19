import { apiUrl } from "@lib/config";
import * as APIv4 from "hyperschedule-shared/api/v4";

// async functions? react? css? never heard of them. who needs those anyways ¯\_(ツ)_/¯
export function importFromLegacy(): Promise<APIv4.ImportV3Response> {
    return new Promise((resolve, reject) => {
        let link: string;
        if (import.meta.env.DEV) {
            link = "http://hyperschedule.io/#v4-import-dev";
        } else {
            link = "https://hyperschedule.io/#v4-import";
        }

        let win: Window;

        function listener(ev: MessageEvent) {
            const payload = APIv4.ImportV3Request.safeParse(ev.data);
            // some extensions post messages too, and we want to ignore those
            if (!payload.success) return;

            win.close();
            window.removeEventListener("message", listener);

            if (payload.data.courses.length !== 0) {
                fetch(`${apiUrl}/v4/user/import-v3-courses`, {
                    body: JSON.stringify(payload.data),
                    method: "POST",
                    credentials: "include",
                })
                    .then(async (r) =>
                        resolve(APIv4.ImportV3Response.parse(await r.json())),
                    )
                    .catch(reject);
            } else {
                reject("No data found from legacy");
            }
        }

        window.addEventListener("message", listener);
        const tmp = window.open(link);
        if (tmp === null) {
            reject("Cannot open new window");
            window.removeEventListener("message", listener);
        } else {
            win = tmp;
        }
    });
}
