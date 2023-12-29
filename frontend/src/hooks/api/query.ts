import * as APIv4 from "hyperschedule-shared/api/v4";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
    getAllTerms,
    getSectionsForTerm,
    getCourseAreaDescription,
    getOfferingHistory,
    getSectionsForTerms,
} from "@hooks/api/fetch";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";
import * as ReactQuery from "@tanstack/react-query";

export const queryClient = new ReactQuery.QueryClient({
    defaultOptions: {
        queries: {
            networkMode: "offlineFirst",
            gcTime: Infinity,
            retry: 1,
        },
    },
});

export function useAllTermsQuery(): UseQueryResult<APIv4.TermIdentifier[]> {
    return useQuery({
        queryKey: ["all terms"],
        queryFn: getAllTerms,
        staleTime: 10 * 60 * 1000,
        refetchInterval: 30 * 60 * 1000,
    });
}

export function useSectionsQuery(
    term: APIv4.TermIdentifier,
): UseQueryResult<APIv4.Section[]> {
    let timeout = 30 * 1000;
    if (APIv4.termIsBefore(term, CURRENT_TERM)) timeout = 60 * 60 * 1000;

    return useQuery({
        queryKey: ["sections", term] as const,
        queryFn: (ctx) => getSectionsForTerm(ctx.queryKey[1]!),
        staleTime: timeout,
        refetchInterval: timeout,
    });
}

//TODO: modify or implement a new hook that gather sections for multiple terms
export function useSectionsForTermsQuery(
    terms: APIv4.TermIdentifier[],
): UseQueryResult<APIv4.Section[]> {
    let timeout = terms.length * 30 * 1000; // to be adjusted

    return useQuery({
        queryKey: ["sectionsForTerms", terms] as const,
        queryFn: (ctx) => getSectionsForTerms(ctx.queryKey[1]!),
        staleTime: timeout,
        refetchInterval: timeout,
    });
}

export function useCourseAreaDescription(): UseQueryResult<
    Map<string, string>
> {
    return useQuery({
        queryKey: ["course areas"],
        queryFn: getCourseAreaDescription,
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}

export function useOfferingHistory(
    term: APIv4.TermIdentifier,
): UseQueryResult<APIv4.OfferingHistory[]> {
    return useQuery({
        queryKey: ["last offered", term] as const,
        queryFn: (ctx) => getOfferingHistory(ctx.queryKey[1]!),
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        gcTime: 24 * 60 * 60 * 1000,
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}
