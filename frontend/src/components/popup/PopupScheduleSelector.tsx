import Dropdown from "@components/common/Dropdown";
import { scheduleDisplayName } from "@lib/schedule";
import { useUserStore } from "@hooks/store/user";
import * as APIv4 from "hyperschedule-shared/api/v4";

export default function PopupScheduleSelector(props: {
    selectedScheduleId: string;
    setSelectedScheduleId: (val: string) => void;
}) {
    const schedules = useUserStore((store) => store.schedules);
    const schedulesSorted = APIv4.getSchedulesSorted(schedules);
    const scheduleChoices = schedulesSorted.map((s) =>
        scheduleDisplayName(s[1]),
    );

    const selectedSchedule = schedules[props.selectedScheduleId];

    return (
        <Dropdown
            choices={scheduleChoices}
            selected={
                selectedSchedule === undefined
                    ? ""
                    : scheduleDisplayName(selectedSchedule)
            }
            onSelect={(index) => {
                props.setSelectedScheduleId(schedulesSorted[index]![0]);
            }}
            emptyPlaceholder={
                scheduleChoices.length > 0
                    ? "no schedule selected"
                    : "please create a schedule first"
            }
        />
    );
}
