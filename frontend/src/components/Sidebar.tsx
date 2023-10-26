import Css from "@components/Sidebar.module.css";
import AppCss from "@components/App.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import useStore, { MainTab } from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import * as Feather from "react-feather";
import ThemeSlider from "./ThemeSlider";
import Dropdown from "@components/common/Dropdown";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Slider from "@components/common/Slider";
import { PopupOption } from "@lib/popup";
import classNames from "classnames";
import { scheduleDisplayName } from "@lib/schedule";
import { useState } from "react";

export default function Sidebar() {
    const tab = useStore((store) => store.mainTab);
    const [show, setShow] = useState<boolean>(false);

    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);
    const serverData = useUserStore((user) => user.server);

    return (
        <>
            <button className={Css.handle} onClick={() => setShow(true)}>
                <Feather.Menu className={Css.handleIcon} />
            </button>
            <div
                className={Css.overlay}
                data-show={show || undefined}
                onClick={() => setShow(false)}
            />
            <div
                className={Css.sidebar}
                data-show={show || undefined}
                data-tab={tab}
            >
                <Toolbar />
                <div className={Css.top}>
                    <button onClick={() => setShow(false)}>
                        <Feather.ChevronRight className={Css.icon} />
                    </button>
                </div>
                {tab === MainTab.CourseSearch ? <MiniMap /> : <></>}

                {serverData === null && !confirmedGuest ? (
                    <></>
                ) : (
                    <>
                        <ScheduleSelect />
                        <SelectedList />

                        <ScheduleRendering />
                    </>
                )}
                <ThemeSlider />
            </div>
        </>
    );
}

function ScheduleSelect() {
    const activeScheduleId = useUserStore((store) => store.activeScheduleId);
    const setActiveScheduleId = useUserStore(
        (store) => store.setActiveScheduleId,
    );
    const userSchedules = useUserStore((store) => store.schedules);
    const setPopup = useStore((store) => store.setPopup);

    const sortedSchedules = APIv4.getSchedulesSorted(userSchedules);
    const scheduleChoices = sortedSchedules.map((s) =>
        scheduleDisplayName(s[1]),
    );
    const selectedSchedule =
        activeScheduleId === null
            ? ""
            : scheduleDisplayName(userSchedules[activeScheduleId]!);
    return (
        <div className={Css.scheduleSelect}>
            <Feather.List className={Css.scheduleIcon} />
            <div className={Css.dropdownContainer}>
                <Dropdown
                    choices={scheduleChoices}
                    selected={selectedSchedule}
                    emptyPlaceholder={
                        sortedSchedules.length > 0
                            ? "no schedule selected"
                            : "no schedule available"
                    }
                    onSelect={(index) =>
                        setActiveScheduleId(sortedSchedules[index]![0])
                    }
                />
            </div>
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.editScheduleButton,
                )}
                onClick={() =>
                    setPopup({ option: PopupOption.ManageSchedules })
                }
            >
                <Feather.Edit className={AppCss.defaultButtonIcon} />
                Edit
            </button>
        </div>
    );
}

function ScheduleRendering() {
    const options = useStore((store) => store.scheduleRenderingOptions);
    const setOptions = useStore((store) => store.setScheduleRenderingOptions);

    return (
        <div className={Css.renderingOptions}>
            <Slider
                value={options.showConflicting}
                text="show conflicting sections"
                onToggle={() => {
                    setOptions({
                        ...options,
                        showConflicting: !options.showConflicting,
                    });
                }}
            />
        </div>
    );
}

function Toolbar() {
    const setPopup = useStore((store) => store.setPopup);

    const loggedIn = useUserStore((user) => user.server) !== null;
    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);

    return (
        <div className={Css.toolbar}>
            {loggedIn ? (
                <button
                    className={classNames(
                        AppCss.defaultButton,
                        Css.button,
                        Css.exportButton,
                    )}
                >
                    Export calendar
                </button>
            ) : (
                <></>
            )}
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.button,
                    Css.aboutButton,
                    Css.iconOnlyButton,
                )}
            >
                <Feather.Info className={Css.icon} />
            </button>

            {loggedIn || confirmedGuest ? (
                <>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.iconOnlyButton,
                            Css.button,
                            Css.settingsButton,
                        )}
                        onClick={() =>
                            setPopup({
                                option: PopupOption.Settings,
                            })
                        }
                    >
                        <Feather.Settings className={Css.icon} />
                    </button>
                </>
            ) : (
                <>
                    <button
                        className={classNames(
                            AppCss.defaultButton,
                            Css.button,
                            Css.loginButton,
                        )}
                        onClick={() => setPopup({ option: PopupOption.Login })}
                    >
                        Login
                        <Feather.User className={AppCss.defaultButtonIcon} />
                    </button>
                </>
            )}
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.iconOnlyButton,
                    Css.button,
                    Css.githubButton,
                )}
            >
                <Feather.GitHub className={Css.icon} />
            </button>
        </div>
    );
}
