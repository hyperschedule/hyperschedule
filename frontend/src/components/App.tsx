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
import SelectedList from "./SelectedList";
import MiniMap from "./MiniMap";
import Popup from "@components/popup/Popup";

import useStore, { MainTab } from "@hooks/store";

export default function App() {
    // memoize `queryClient` with empty dependency list to ensure it only gets
    // constructed/initialized once throughout the app's lifecycle
    const queryClient = React.useMemo(() => new ReactQuery.QueryClient(), []);

    const theme = useStore((store) => store.theme);
    const mainTab = useStore((store) => store.mainTab);

    return (
        <ReactQuery.QueryClientProvider client={queryClient}>
            <div className={Css.app} data-theme={theme}>
                <Popup />
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
                        <Schedule />
                    </div>
                </div>
                <div className={Css.sidebar}>
                    <Toolbar />
                    <MiniMap />
                    <SelectedList />
                </div>
                <ThemeSlider />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </ReactQuery.QueryClientProvider>
    );
}
