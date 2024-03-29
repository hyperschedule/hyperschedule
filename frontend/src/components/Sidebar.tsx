import Css from "@components/Sidebar.module.css";
import AppCss from "@components/App.module.css";
import MainSelectorCss from "@components/MainSelector.module.css";
import MiniMap from "@components/MiniMap";
import SelectedList from "@components/SelectedList";
import * as React from "react";
import { useState } from "react";
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
import { createPortal } from "react-dom";
import { GITHUB_LINK } from "@lib/constants";
import { memo } from "react";
import { useActiveSchedule } from "@hooks/schedule";

export default function Sidebar() {
    const tab = useStore((store) => store.mainTab);
    const [show, setShow] = useState<boolean>(false);

    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);
    const serverData = useUserStore((user) => user.server);

    // we need to teleport the button to MainSelector, but it's not necessarily
    // rendered when sidebar is first rendered. however, once MainSelector is rendered
    // it never disappears.
    const [teleportTarget, setTeleportTarget] = useState<HTMLDivElement | null>(
        null,
    );
    const teleportSelector = `div.${MainSelectorCss.showSidebar}`;

    React.useEffect(function recheckTeleport() {
        const el = document.querySelector(teleportSelector);
        if (el === null)
            window.requestAnimationFrame(() => {
                // this recursion is probably not necessary, but we are doing this just to be safe
                recheckTeleport();
            });
        else setTeleportTarget(el as HTMLDivElement);
    }, []);

    return (
        <>
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
                <div className={Css.toolbar}>
                    {!show && teleportTarget !== null ? (
                        createPortal(
                            <button
                                className={classNames(
                                    Css.showSidebarButton,
                                    AppCss.defaultButton,
                                )}
                                onClick={() => setShow(true)}
                            >
                                <Feather.Menu className={Css.showSidebarIcon} />
                            </button>,
                            teleportTarget,
                        )
                    ) : (
                        <></>
                    )}

                    <button
                        onClick={() => setShow(false)}
                        className={classNames(
                            AppCss.defaultButton,
                            Css.iconOnlyButton,
                            Css.button,
                            Css.hideSidebarButton,
                        )}
                    >
                        <Feather.ChevronRight className={Css.icon} />
                    </button>
                    <Toolbar />
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

const ScheduleSelect = memo(function ScheduleSelect() {
    const activeSchedule = useActiveSchedule();
    const setActiveScheduleId = useUserStore(
        (store) => store.setActiveScheduleId,
    );
    const userSchedules = useUserStore((store) => store.schedules);
    const setPopup = useStore((store) => store.setPopup);

    const sortedSchedules = APIv4.getSchedulesSorted(userSchedules);
    const scheduleChoices = sortedSchedules.map((s) =>
        scheduleDisplayName(s[1]),
    );

    const selectedScheduleName =
        activeSchedule === undefined ? "" : scheduleDisplayName(activeSchedule);
    return (
        <div className={Css.scheduleSelect}>
            <Feather.List className={Css.scheduleIcon} />
            <div className={Css.dropdownContainer}>
                <Dropdown
                    choices={scheduleChoices}
                    selected={selectedScheduleName}
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
});

const ScheduleRendering = memo(function ScheduleRendering() {
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
});

const Toolbar = memo(function Toolbar() {
    const setPopup = useStore((store) => store.setPopup);

    const loggedIn = useUserStore((user) => user.server) !== null;
    const confirmedGuest = useUserStore((user) => user.hasConfirmedGuest);

    return (
        <>
            <button
                className={classNames(
                    AppCss.defaultButton,
                    Css.button,
                    Css.aboutButton,
                    Css.iconOnlyButton,
                )}
                onClick={() =>
                    setPopup({
                        option: PopupOption.About,
                    })
                }
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
                    <button
                        onClick={() =>
                            setPopup({
                                option: PopupOption.ExportCalendar,
                            })
                        }
                        className={classNames(
                            AppCss.defaultButton,
                            Css.button,
                            Css.exportButton,
                        )}
                    >
                        Export calendar
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
                        <Feather.User className={Css.icon} />
                        Login
                    </button>
                </>
            )}
            <a
                className={classNames(
                    AppCss.defaultButton,
                    Css.iconOnlyButton,
                    Css.button,
                    Css.githubButton,
                )}
                href={GITHUB_LINK}
                target="_blank"
            >
                <Feather.GitHub className={Css.icon} />
            </a>
        </>
    );
});
