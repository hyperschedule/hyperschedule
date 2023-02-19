import { z } from "zod";
import type { CourseFiles } from "../course";

/**
 * defines which param an endpoint use, if any
 */
export const Params = z.union([
    z.literal("catalog"),
    z.literal("session"),
    z.literal("year"),
]);
export type Params = z.infer<typeof Params>;

const Endpoint = z.object({
    link: z.string().url(),
    params: Params.nullable(),
    // number of seconds between fetch
    interval: z.number().positive(),
    saveAs: z.string(),
});
export type Endpoint = z.infer<typeof Endpoint>;
export type Endpoints = Record<
    keyof CourseFiles | "courseAreaDescription",
    Endpoint
>;
