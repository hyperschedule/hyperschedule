import { useUserStore } from "@hooks/store/user";
import { useMemo } from "react";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { useOfferingHistory } from "@hooks/api/query";

export function useOfferingHistoryLookup(): Map<
    string,
    APIv4.TermIdentifier[]
> {
    const activeTerm = useUserStore((store) => store.activeTerm);
    const offeringHistory = useOfferingHistory(activeTerm);

    return useMemo(() => {
        if (!offeringHistory.data)
            return new Map<string, APIv4.TermIdentifier[]>();

        return new Map<string, APIv4.TermIdentifier[]>(
            offeringHistory.data.map((entry) => [
                APIv4.stringifyCourseCode(entry.code),
                entry.terms.filter((t) => APIv4.termIsBefore(t, activeTerm)),
            ]),
        );
    }, [offeringHistory.data]);
}
