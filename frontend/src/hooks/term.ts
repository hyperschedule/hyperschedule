import { useCurrentTermQuery } from "@hooks/api/term";
import { useActiveSchedule } from "@hooks/user";

export function useActiveTerm() {
    const currentTermQuery = useCurrentTermQuery();
    const activeSchedule = useActiveSchedule();
    return activeSchedule?.term ?? currentTermQuery?.data;
}
