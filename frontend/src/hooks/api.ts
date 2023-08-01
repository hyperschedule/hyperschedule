import * as APIv4 from "hyperschedule-shared/api/v4";

import { apiUrl } from "@lib/config";
import { useQuery } from "@tanstack/react-query";

async function getCourses() {
    const resp = await fetch(`${apiUrl}/v4/sections`);
    return APIv4.Section.array().parse(await resp.json());
}

async function getCourseAreaDescription() {
    const resp = await fetch(`${apiUrl}/v4/course-areas`);
    return new Map<string, string>(
        (await resp.json()).map((a: { area: string; description: string }) => [
            a.area,
            a.description,
        ]),
    );
}

export type Courses = APIv4.Section[];

export function useCourses() {
    return useQuery({
        queryKey: ["courses"],
        queryFn: getCourses,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}

export function useCourseAreaDescription() {
    return useQuery({
        queryKey: ["course-areas"],
        queryFn: getCourseAreaDescription,
        staleTime: 24 * 60 * 60 * 1000, // 1 day
        refetchInterval: 24 * 60 * 60 * 1000,
    });
}
