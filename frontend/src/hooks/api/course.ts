import * as APIv4 from "hyperschedule-shared/api/v4";

import { apiUrl } from "@lib/config";
import { useQuery } from "@tanstack/react-query";

async function getSectionsForTerm(term: APIv4.TermIdentifier) {
    const resp = await fetch(`${apiUrl}/v4/sections/${term.year}/${term.term}`);
    return APIv4.Section.array().parse(await resp.json());
}

async function getCourseAreaDescription() {
    const resp = await fetch(`${apiUrl}/v4/course-areas`);
    return new Map<string, string>(
        (await resp.json()).map((a: { area: string; description: string }) => [
            a.area,
            a.description,
        ]),
    );
}

export function useSectionsQuery(term: APIv4.TermIdentifier | undefined) {
    // only enable query _after_ a term has been specified
    return useQuery({
        queryKey: ["sections", term] as const,
        queryFn: (ctx) => getSectionsForTerm(ctx.queryKey[1]!),
        enabled: !!term,
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
