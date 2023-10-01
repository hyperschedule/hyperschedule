import { useUserStore } from "@hooks/store/user";
import useStore from "@hooks/store";
import { PopupOption } from "@lib/popup";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Css from "./Toolbar.module.css";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import Dropdown from "@components/common/Dropdown";
import * as Feather from "react-feather";
import { pick } from "@lib/store";

function scheduleDisplayName(schedule: APIv4.UserSchedule) {
    return `${schedule.name} (${APIv4.stringifyTermIdentifier(schedule.term)})`;
}

export default function Toolbar() {
    const loggedIn = useUserStore((user) => user.serverUser);
    const activeTerm = useStore((store) => store.activeTerm);

    function loginThroughCAS() {
        window.location.href = `${__API_URL__}/auth/saml`;
    }

    const user = useUserStore();
    const schedules = APIv4.getSchedulesSorted(user.schedule);
    const { activeScheduleId, setActiveScheduleId } = useStore(
        pick("activeScheduleId", "setActiveScheduleId"),
    );

    const scheduleChoices = schedules.map((s) => scheduleDisplayName(s[1]));
    const selectedSchedule =
        activeScheduleId === null
            ? ""
            : scheduleDisplayName(user.schedule[activeScheduleId]!);

    return (
        <div className={Css.toolbar}>
            {activeTerm.term === CURRENT_TERM.term &&
            activeTerm.year ===
                CURRENT_TERM.year ? null /*<button onClick={() => legacyImport.mutate()}>
                    Import from legacy
                </button>*/ : (
                <></>
            )}
            <button>Report issues</button>
            <button>Export calendar</button>
            <Feather.GitHub />
            <Dropdown
                choices={scheduleChoices}
                selected={selectedSchedule}
                emptyPlaceholder="no schedule selected"
                onSelect={(index) => setActiveScheduleId(schedules[index]![0])}
            />

            {loggedIn ? (
                "logged in"
            ) : (
                <>
                    guest
                    <button onClick={loginThroughCAS}>Login</button>
                </>
            )}
        </div>
    );
}
