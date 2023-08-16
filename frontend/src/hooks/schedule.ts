import { useMemo } from "react";

import { useUserQuery } from "@hooks/api/user";
import { useActiveSectionsLookup } from "@hooks/section";
import * as APIv4 from "hyperschedule-shared/api/v4";

import * as Lib from "@lib/schedule";

import useStore from "@hooks/store";

export function useActiveSchedule() {
    const userQuery = useUserQuery();
    const activeScheduleIndex = useStore((store) => store.activeScheduleIndex);
    return userQuery.data?.schedules[activeScheduleIndex];
}

export function useActiveScheduleEntries() {
    const schedule = useActiveSchedule();
    return schedule?.sections ?? [];
}

export function useActiveScheduleLookup() {
    const entries = useActiveScheduleEntries();
    return useMemo(() => {
        const lookup = new Map<string, APIv4.UserSection>();
        for (const entry of entries)
            lookup.set(APIv4.stringifySectionCodeLong(entry.section), entry);
        return lookup;
    }, [entries]);
}

export function useActiveScheduleResolved() {
    const entries = useActiveScheduleEntries();
    const lookup = useActiveSectionsLookup();

    const expandKey = useStore((store) => store.expandKey);

    const main = useMemo(() => {
        const sections: Readonly<APIv4.Section>[] = [];
        const bounds = { ...Lib.defaultBounds };

        for (const entry of entries) {
            if (!entry.attrs.selected) continue;
            const section = lookup.get(
                APIv4.stringifySectionCodeLong(entry.section),
            );
            if (!section) continue;
            sections.push(section);
            Lib.updateBounds(bounds, section);
        }

        return { sections, bounds, cards: sections.flatMap(Lib.getCards) };
    }, [entries, lookup]);

    const expand = useMemo(() => {
        const bounds = { ...Lib.defaultBounds };
        if (!expandKey) return null;
        const expandSection = lookup.get(
            APIv4.stringifySectionCodeLong(expandKey),
        );
        if (!expandSection) return null;

        Lib.updateBounds(bounds, expandSection);

        return { bounds, cards: Lib.getCards(expandSection) };
    }, [expandKey, lookup]);

    const bounds = expand
        ? Lib.combineBounds(main.bounds, expand.bounds)
        : main.bounds;

    return {
        sections: main.sections,
        cards: main.cards,
        expandCards: expand?.cards ?? [],
        bounds,
        startHour: Math.floor(bounds.startTime / 3600),
        endHour: Math.ceil(bounds.endTime / 3600),
    };
}
