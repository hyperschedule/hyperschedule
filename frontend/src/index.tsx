import { createRoot } from "react-dom/client";
import App from "@components/App";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
import * as ReactQuery from "@tanstack/react-query";

export default function Root() {
    // memoize `queryClient` with empty dependency list to ensure it only gets
    // constructed/initialized once throughout the app's lifecycle
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);
    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
        </ReactQuery.QueryClientProvider>
    );
}

// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
createRoot(document.getElementById("root")!).render(<Root />);
