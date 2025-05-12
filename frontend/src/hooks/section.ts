import { useSectionsQuery } from "@hooks/api/query";

import { useMemo } from "react";

import * as APIv4 from "hyperschedule-shared/api/v4";
import { useUserStore } from "@hooks/store/user";

export function useActiveSectionsQuery(): APIv4.Section[] | undefined {
    const activeTerm = useUserStore((store) => store.activeTerm);
    return useSectionsQuery(activeTerm).data;
}

export function useSectionsLookup(
    term: APIv4.TermIdentifier,
): Map<string, APIv4.Section> {
    const sectionsQuery = useSectionsQuery(term).data;

    return useMemo(() => {
        const lookup = new Map<string, APIv4.Section>();

        if (!sectionsQuery) return lookup;
        for (const section of sectionsQuery)
            lookup.set(
                APIv4.stringifySectionCodeLong(section.identifier),
                section,
            );

        return lookup;
    }, [sectionsQuery]);
}

// returns a map of section identifier strings to sections
export function useActiveSectionsLookup(): Map<string, APIv4.Section> {
    return useSectionsLookup(useUserStore((store) => store.activeTerm));
}
