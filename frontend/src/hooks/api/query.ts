import * as APIv4 from "hyperschedule-shared/api/v4";

import { useQuery } from "@tanstack/react-query";
import {
    getAllTerms,
    getSectionsForTerm,
    getCourseAreaDescription,
    getOfferingHistory,
} from "@hooks/api/fetch";
import { useMemo } from "react";
import { useUserStore } from "@hooks/store/user";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

export function useAllTermsQuery() {
    return useQuery({
        queryKey: ["all terms"],
        queryFn: getAllTerms,
        staleTime: 10 * 60 * 1000,
        refetchInterval: 30 * 60 * 1000,
    });
}

export function useSectionsQuery(term: APIv4.TermIdentifier) {
    let timeout = 30 * 1000;
    if (APIv4.termIsBefore(term, CURRENT_TERM)) timeout = 60 * 60 * 1000;

    return useQuery({
        queryKey: ["sections", term] as const,
        queryFn: (ctx) => getSectionsForTerm(ctx.queryKey[1]!),
        staleTime: timeout,
        refetchInterval: timeout,
    });
}

export function useCourseAreaDescription() {
    return useQuery({
        queryKey: ["course areas"],
        queryFn: getCourseAreaDescription,
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}

export function useOfferingHistory(term: APIv4.TermIdentifier) {
    return useQuery({
        queryKey: ["last offered", term] as const,
        queryFn: (ctx) => getOfferingHistory(ctx.queryKey[1]!),
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        gcTime: 24 * 60 * 60 * 1000,
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}
