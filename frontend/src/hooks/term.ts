import { useAllTermsQuery } from "@hooks/api/term";

export function useAllTerms() {
    const allTermsQuery = useAllTermsQuery();
    return allTermsQuery.data;
}
