import type { ScheduleRenderingOptions } from "@hooks/store";
import { memo } from "react";
import Schedule from "./Schedule";
import { useActiveScheduleResolved } from "@hooks/schedule";

export default memo(function ActiveSchedule(options: ScheduleRenderingOptions) {
    return (
        <Schedule
            options={options}
            resolvedSchedule={useActiveScheduleResolved()}
        />
    );
});
