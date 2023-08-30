import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@lib/config";
import * as APIv4 from "hyperschedule-shared/api/v4";

export async function getAllTerms() {
    const resp = await fetch(`${apiUrl}/v4/term/all`);
    return APIv4.TermIdentifier.array().parse(await resp.json());
}

export function useAllTermsQuery() {
    return useQuery({
        queryKey: ["term/all"],
        queryFn: getAllTerms,
        staleTime: 10 * 60 * 1000,
        refetchInterval: 30 * 60 * 1000,
    });
}
