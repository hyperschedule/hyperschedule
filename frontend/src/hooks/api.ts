import type * as Api from "hyperschedule-shared/api/v4";

import { apiUrl } from "@lib/config";
import { useQuery } from "@tanstack/react-query";

async function getCourses() {
    const resp = await fetch(`${apiUrl}/v4/sections`);
    return (await resp.json()) as Api.Section[];
}

export type Courses = Api.Section[];

export function useCourses() {
    return useQuery({
        queryKey: ["courses"],
        queryFn: getCourses,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}
