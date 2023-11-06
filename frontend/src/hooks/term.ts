import { useAllTermsQuery } from "@hooks/api/query";
import type * as APIv4 from "hyperschedule-shared/api/v4";

export function useAllTerms(): APIv4.TermIdentifier[] | undefined {
    const allTermsQuery = useAllTermsQuery();
    return allTermsQuery.data;
}
