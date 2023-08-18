import { useUserQuery } from "@hooks/api/user";
import useStore, { PopupOption } from "@hooks/store";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import classNames from "classnames";
import Css from "./Toolbar.module.css";

export default function Toolbar() {
    const userQuery = useUserQuery();
    const setPopup = useStore((store) => store.setPopup);
    return (
        <>
            {userQuery.data ? (
                <ToolbarLoggedIn user={userQuery.data} />
            ) : (
                <button onClick={() => setPopup({ option: PopupOption.Login })}>
                    Login
                </button>
            )}
        </>
    );
}

function ToolbarLoggedIn(props: { user: APIv4.User }) {
    const { activeScheduleIndex, setActiveScheduleIndex } = useStore(
        (store) => ({
            activeScheduleIndex: store.activeScheduleIndex,
            setActiveScheduleIndex: store.setActiveScheduleIndex,
        }),
    );

    return (
        <div>
            <div>logged in as {props.user.isGuest ? "guest" : "someone"}</div>
            <div>
                {props.user.schedules.map((schedule, i) => (
                    <button
                        key={schedule._id}
                        className={classNames({
                            active: activeScheduleIndex === i,
                        })}
                        onClick={() => setActiveScheduleIndex(i)}
                    >
                        {schedule.name} ({schedule.term.year}{" "}
                        {schedule.term.term})
                    </button>
                ))}
            </div>
        </div>
    );
}
