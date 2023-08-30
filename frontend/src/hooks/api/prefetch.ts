import {
    getCourseAreaDescription,
    getSectionsForTerm,
    getOfferingHistory,
} from "./course";
import type * as APIv4 from "hyperschedule-shared/api/v4";
import type { QueryClient } from "@tanstack/react-query";

export function prefetchDataForTerm(
    term: APIv4.TermIdentifier,
    queryClient: QueryClient,
) {
    return Promise.all([
        queryClient.prefetchQuery({
            queryKey: ["course-areas"],
            queryFn: getCourseAreaDescription,
            staleTime: 60 * 1000,
        }),
        queryClient.prefetchQuery({
            queryKey: ["sections", term],
            queryFn: () => getSectionsForTerm(term),
            staleTime: 60 * 1000,
        }),
        queryClient.prefetchQuery({
            queryKey: ["last-offered", term],
            queryFn: () => getOfferingHistory(term),
            staleTime: 60 * 1000,
        }),
    ]);
}
