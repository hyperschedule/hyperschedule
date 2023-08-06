import { useSectionsQuery } from "@hooks/api/course";
import { useActiveTerm } from "@hooks/term";

import { useMemo } from "react";

import * as APIv4 from "hyperschedule-shared/api/v4";

export function useActiveSectionsQuery() {
    const activeTerm = useActiveTerm();
    return useSectionsQuery(activeTerm);
}

export function useActiveSectionsLookup() {
    const sectionsQuery = useActiveSectionsQuery();

    return useMemo(() => {
        const lookup = new Map<string, APIv4.Section>();

        if (!sectionsQuery.data) return lookup;
        for (const section of sectionsQuery.data)
            lookup.set(
                APIv4.stringifySectionCodeLong(section.identifier),
                section,
            );

        return lookup;
    }, [sectionsQuery.data]);
}
