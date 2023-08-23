import * as React from "react";
import Css from "./App.module.css";

import * as ReactQuery from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import classNames from "classnames";

import ThemeSlider from "./ThemeSlider";
import CourseSearch from "./course-search/CourseSearch";
import Schedule from "./schedule/Schedule";
import MainSelector from "./MainSelector";
import Toolbar from "./Toolbar";
import Popup from "@components/popup/Popup";
import { ToastContainer, Slide } from "react-toastify";

import useStore, { MainTab } from "@hooks/store";
import Sidebar from "./Sidebar";

import "react-toastify/dist/ReactToastify.min.css";

export default function App() {
    // memoize `queryClient` with empty dependency list to ensure it only gets
    // constructed/initialized once throughout the app's lifecycle
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);

    const theme = useStore((store) => store.theme);
    const mainTab = useStore((store) => store.mainTab);

    // we pass in schedule rendering options as props so we can make a screenshot of the schedule with only certain options
    // in the future
    const scheduleRenderingOptions = useStore(
        (store) => store.scheduleRenderingOptions,
    );

    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <div className={Css.app} data-theme={theme}>
                <Popup />
                <Toolbar />
                <div className={Css.main}>
                    <MainSelector />
                    <div
                        className={classNames(Css.mainContent, {
                            [Css.visible!]: mainTab === MainTab.CourseSearch,
                        })}
                    >
                        <CourseSearch />
                    </div>
                    <div
                        className={classNames(Css.mainContent, {
                            [Css.visible!]: mainTab === MainTab.Schedule,
                        })}
                    >
                        <Schedule {...scheduleRenderingOptions} />
                    </div>
                </div>
                <Sidebar />
                <ThemeSlider />
                <ToastContainer
                    position="top-center"
                    hideProgressBar
                    theme={theme}
                    transition={Slide}
                />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </ReactQuery.QueryClientProvider>
    );
}
