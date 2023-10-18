import { createRoot } from "react-dom/client";

import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

import { MAIN_STORE_NAME, USER_STORE_NAME } from "@lib/constants";
import { useState } from "react";

// this is rendered if there's a repeated UI crash or the user tried to view their data.
// do not use any hyperschedule UI component here.
function JSONViewer() {
    const [cloudData, setCloudData] = useState<
        Record<string, unknown> | string | undefined | null
    >(undefined);

    if (window.location.hash !== "") {
        const data = JSON.parse(atob(window.location.hash.slice(1)));
        return <JsonView src={data} displaySize="collapsed" />;
    }

    function retrieveCloud() {
        (async function () {
            // no schemaFetch because import might be unstable
            const headers = await fetch(`${__API_URL__}/v4/user`, {
                credentials: "include",
            });
            if (headers.status === 401) {
                setCloudData("Not logged in");
            } else if (!headers.ok) {
                setCloudData("Network error");
            } else {
                setCloudData(await headers.json());
            }
        })().catch(() => setCloudData("Failed"));
    }

    return (
        <div>
            <h3>Cloud data</h3>
            {cloudData === undefined ? (
                <button onClick={retrieveCloud}>Retrieve</button>
            ) : cloudData === null ? (
                "pending"
            ) : typeof cloudData === "string" ? (
                cloudData
            ) : (
                <JsonView src={cloudData} displaySize="collapsed" />
            )}

            <h3>Persistent interface data (local)</h3>
            <JsonView
                src={JSON.parse(localStorage.getItem(MAIN_STORE_NAME) ?? "{}")}
                displaySize="collapsed"
            />

            <h3>Persistent user data (local)</h3>
            <JsonView
                src={JSON.parse(localStorage.getItem(USER_STORE_NAME) ?? "{}")}
                displaySize="collapsed"
            />
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    // line-height is needed for https://github.com/YYsuni/react18-json-view/issues/24
    <div style={{ lineHeight: "1.25em", fontFamily: "Inter, sans-serif" }}>
        <JSONViewer />
    </div>,
);
