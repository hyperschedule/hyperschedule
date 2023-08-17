// async functions? react? css? never heard of them
import { apiUrl } from "@lib/config";
import * as APIv4 from "hyperschedule-shared/api/v4";

export function importFromLegacy(): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const frame = document.createElement("iframe");
        frame.style.width = "0px";
        frame.style.height = "0px";
        frame.style.position = "fixed";
        frame.style.top = "0";
        frame.style.left = "0";
        frame.style.visibility = "hidden";

        if (import.meta.env.DEV) {
            frame.src = "https://hyperschedule.io/#v4-import-dev";
        } else {
            frame.src = "https://hyperschedule.io/#v4-import";
        }

        function listener(ev: MessageEvent) {
            window.removeEventListener("message", listener);
            document.body.removeChild(frame);
            fetch(`${apiUrl}/v4/user/import-v3-courses`, {
                body: JSON.stringify(
                    APIv4.ImportV3Request.parse({ courses: ev.data }),
                ),
                method: "POST",
                credentials: "include",
            })
                .then(resolve)
                .catch(reject);
        }

        window.addEventListener("message", listener);
        document.body.append(frame);
    });
}
