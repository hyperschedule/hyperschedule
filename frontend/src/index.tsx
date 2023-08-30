import { createRoot } from "react-dom/client";
import App from "@components/App";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
import * as ReactQuery from "@tanstack/react-query";
import { prefetchDataForTerm } from "@hooks/api/prefetch";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

export default function Root() {
    // memoize `queryClient` with empty dependency list to ensure it only gets
    // constructed/initialized once throughout the app's lifecycle
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);
    void prefetchDataForTerm(CURRENT_TERM, queryClient);
    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
            <ReactQueryDevtools initialIsOpen={false} />
        </ReactQuery.QueryClientProvider>
    );
}

// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
createRoot(document.getElementById("root")!).render(<Root />);
