import {
    getCourseAreaDescription,
    getSectionsForTerm,
    getOfferingHistory,
} from "./fetch";
import * as APIv4 from "hyperschedule-shared/api/v4";
import type { QueryClient } from "@tanstack/react-query";
import { CURRENT_TERM } from "hyperschedule-shared/api/current-term";

export function prefetchDataForTerm(
    term: APIv4.TermIdentifier,
    queryClient: QueryClient,
) {
    let timeout = 30 * 1000;
    if (APIv4.termIsBefore(term, CURRENT_TERM)) timeout = 60 * 60 * 1000;

    return Promise.all([
        queryClient.prefetchQuery({
            queryKey: ["course areas"],
            queryFn: getCourseAreaDescription,
            staleTime: timeout,
        }),
        queryClient.prefetchQuery({
            queryKey: ["sections", term],
            queryFn: () => getSectionsForTerm(term),
            staleTime: timeout,
        }),
        queryClient.prefetchQuery({
            queryKey: ["offering history", term],
            queryFn: () => getOfferingHistory(term),
            staleTime: timeout,
        }),
    ]);
}
