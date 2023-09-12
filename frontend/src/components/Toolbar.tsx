import {
    useUserQuery,
    useLegacyImport,
    useActiveScheduleMutation,
} from "@hooks/api/user";
import useStore, { PopupOption } from "@hooks/store";
import * as APIv4 from "hyperschedule-shared/api/v4";
import classNames from "classnames";
import Css from "./Toolbar.module.css";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import Dropdown from "@components/common/Dropdown";
import { useState } from "react";

export default function Toolbar() {
    const userQuery = useUserQuery();
    const legacyImport = useLegacyImport();
    const activeTerm = useStore((store) => store.activeTerm);

    const setPopup = useStore((store) => store.setPopup);
    return (
        <div className={Css.toolbar}>
            {activeTerm.term === CURRENT_TERM.term &&
            activeTerm.year === CURRENT_TERM.year ? (
                <button onClick={() => legacyImport.mutate()}>
                    Import from legacy
                </button>
            ) : (
                <></>
            )}
            {userQuery.data ? (
                <ToolbarLoggedIn user={userQuery.data} />
            ) : (
                <button onClick={() => setPopup({ option: PopupOption.Login })}>
                    Login
                </button>
            )}
        </div>
    );
}

function scheduleDisplayName(schedule: APIv4.UserSchedule) {
    return `${schedule.name} (${APIv4.stringifyTermIdentifier(schedule.term)})`;
}

function ToolbarLoggedIn(props: { user: APIv4.User }) {
    const activeScheduleId = useStore((store) => store.activeScheduleId);
    const activeScheduleMutation = useActiveScheduleMutation();

    const schedules = APIv4.getSchedulesSorted(props.user.schedules);
    const scheduleChoices = schedules.map((s) => scheduleDisplayName(s[1]));
    const selectedSchedule =
        activeScheduleId === null
            ? ""
            : scheduleDisplayName(props.user.schedules[activeScheduleId]!);

    return (
        <div>
            <div>logged in as {props.user.isGuest ? "guest" : "someone"}</div>
            <div>
                <Dropdown
                    choices={scheduleChoices}
                    selected={selectedSchedule}
                    onSelect={(index) => {
                        activeScheduleMutation.mutate({
                            scheduleId: schedules[index]![0],
                        });
                    }}
                />
            </div>
        </div>
    );
}
