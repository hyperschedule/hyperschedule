import * as APIv4 from "hyperschedule-shared/api/v4";

import { useQuery } from "@tanstack/react-query";

import { useMemo } from "react";
import useStore from "@hooks/store";
import { useUserStore } from "@hooks/store/user";

export async function getSectionsForTerm(term: APIv4.TermIdentifier) {
    const resp = await fetch(
        `${__API_URL__}/v4/sections/${APIv4.stringifyTermIdentifier(term)}`,
    );
    const sections = APIv4.Section.array().parse(await resp.json());
    // we want the areas for schools to appear last, which is sorted numerically
    sections.forEach((s) => s.courseAreas.reverse());
    return sections;
}

export async function getCourseAreaDescription() {
    const resp = await fetch(`${__API_URL__}/v4/course-areas`);
    return new Map<string, string>(
        (await resp.json()).map((a: { area: string; description: string }) => [
            a.area,
            a.description,
        ]),
    );
}

export async function getOfferingHistory(term: APIv4.TermIdentifier) {
    const resp = await fetch(
        `${__API_URL__}/v4/offering-history/${APIv4.stringifyTermIdentifier(
            term,
        )}`,
    );
    return APIv4.OfferingHistory.array().parse(await resp.json());
}

export function useSectionsQuery(term: APIv4.TermIdentifier) {
    // only enable query _after_ a term has been specified
    return useQuery({
        queryKey: ["sections", term] as const,
        queryFn: (ctx) => getSectionsForTerm(ctx.queryKey[1]!),
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useCourseAreaDescription() {
    return useQuery({
        queryKey: ["course-areas"],
        queryFn: getCourseAreaDescription,
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}

export function useOfferingHistory(term: APIv4.TermIdentifier) {
    return useQuery({
        queryKey: ["last-offered", term] as const,
        queryFn: (ctx) => getOfferingHistory(ctx.queryKey[1]!),
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}

export function useOfferingHistoryLookup() {
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
