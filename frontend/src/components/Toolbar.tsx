import { useUserQuery, useLogin } from "@hooks/api/user";
import useStore from "@hooks/store";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import classNames from "classnames";

export default function Toolbar() {
    const loginMutation = useLogin();

    const userQuery = useUserQuery();

    return (
        <>
            {userQuery.data ? (
                <ToolbarLoggedIn user={userQuery.data} />
            ) : (
                <button onClick={() => loginMutation.mutate()}>login</button>
            )}
        </>
    );
}

function ToolbarLoggedIn(props: { user: APIv4.User }) {
    const { activeScheduleIndex } = useStore((store) => ({
        activeScheduleIndex: store.activeScheduleIndex,
    }));

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
                    >
                        {schedule.name} ({schedule.term.year}{" "}
                        {schedule.term.term})
                    </button>
                ))}
            </div>
        </div>
    );
}
