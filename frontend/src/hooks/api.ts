import type * as Api from "hyperschedule-shared/api/v4";

import { apiUrl } from "@lib/config";
import { useQuery } from "react-query";

async function getCourses() {
    const resp = await fetch(`${apiUrl}/v4/courses`);
    return (await resp.json()) as Api.Section[];
}

export type Courses = Api.Section[];
export function useCourses() {
    return useQuery("courses", getCourses);
}
