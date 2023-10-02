import { useSectionsQuery } from "@hooks/api/course";

import { useMemo } from "react";

import * as APIv4 from "hyperschedule-shared/api/v4";
import { useUserStore } from "@hooks/store/user";

export function useActiveSectionsQuery() {
    const activeTerm = useUserStore((store) => store.activeTerm);
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
