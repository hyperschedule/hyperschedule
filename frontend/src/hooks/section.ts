import { useSectionsQuery } from "@hooks/api/course";

import { useMemo } from "react";

import * as APIv4 from "hyperschedule-shared/api/v4";
import useStore from "@hooks/store";

export function useActiveSectionsQuery() {
    const activeTerm = useStore((store) => store.activeTerm);
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
