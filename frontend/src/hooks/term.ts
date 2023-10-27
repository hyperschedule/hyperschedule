import { useAllTermsQuery } from "@hooks/api/query";

export function useAllTerms() {
    const allTermsQuery = useAllTermsQuery();
    return allTermsQuery.data;
}
