import { useMemo } from "react";

import { useUserQuery, useScheduleSectionMutation } from "@hooks/api/user";
import * as APIv4 from "hyperschedule-shared/api/v4";

import useStore from "@hooks/store";

export function useActiveSchedule() {
    const userQuery = useUserQuery();
    const activeScheduleIndex = useStore((store) => store.activeScheduleIndex);
    return userQuery.data?.schedules[activeScheduleIndex];
}

export function useActiveScheduleLookup() {
    const schedule = useActiveSchedule();
    return useMemo(() => {
        const lookup = new Map<string, APIv4.UserSection>();
        if (!schedule) return lookup;

        for (const entry of schedule.sections)
            lookup.set(APIv4.stringifySectionCodeLong(entry.section), entry);

        return lookup;
    }, [schedule]);
}
