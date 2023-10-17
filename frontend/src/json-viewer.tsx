import { createRoot } from "react-dom/client";

import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { MAIN_STORE_NAME, USER_STORE_NAME } from "@lib/constants";

function JSONViewer() {
    if (window.location.hash !== "") {
        const data = JSON.parse(atob(window.location.hash.slice(1)));
        return (
            <JsonView
                data={data}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
            />
        );
    }

    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            <h3>Interface Data</h3>
            <JsonView
                data={JSON.parse(localStorage.getItem(MAIN_STORE_NAME) ?? "{}")}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
            />

            <h3>User Data</h3>
            <JsonView
                data={JSON.parse(localStorage.getItem(USER_STORE_NAME) ?? "{}")}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
            />
        </div>
    );
}

createRoot(document.getElementById("root")!).render(<JSONViewer />);
