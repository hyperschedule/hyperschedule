import { useCurrentTermQuery, useAllTermsQuery } from "@hooks/api/term";
import { useActiveSchedule } from "@hooks/schedule";

export function useActiveTerm() {
    const currentTermQuery = useCurrentTermQuery();
    const activeSchedule = useActiveSchedule();
    return activeSchedule?.term ?? currentTermQuery.data;
}

export function useAllTerms() {
    const allTermsQuery = useAllTermsQuery();
    return allTermsQuery.data;
}
