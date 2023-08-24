import { useUserQuery, useLegacyImport } from "@hooks/api/user";
import useStore, { PopupOption } from "@hooks/store";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import classNames from "classnames";
import Css from "./Toolbar.module.css";

export default function Toolbar() {
    const userQuery = useUserQuery();
    const legacyImport = useLegacyImport();

    const setPopup = useStore((store) => store.setPopup);
    return (
        <div className={Css.toolbar}>
            <button onClick={() => legacyImport.mutate()}>
                Import from legacy
            </button>
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

function ToolbarLoggedIn(props: { user: APIv4.User }) {
    const { activeScheduleId, setActiveScheduleId } = useStore((store) => ({
        activeScheduleId: store.activeScheduleId,
        setActiveScheduleId: store.setActiveScheduleId,
    }));

    return (
        <div>
            <div>logged in as {props.user.isGuest ? "guest" : "someone"}</div>
            <div>
                {Object.entries(props.user.schedules).map(([id, schedule]) => (
                    <button
                        key={id}
                        className={classNames({
                            active: activeScheduleId === id,
                        })}
                        onClick={() => setActiveScheduleId(id)}
                    >
                        {schedule.name} ({schedule.term.year}{" "}
                        {schedule.term.term})
                    </button>
                ))}
            </div>
        </div>
    );
}
