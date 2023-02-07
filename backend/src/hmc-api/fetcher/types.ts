import { z } from "zod";
import { CourseFiles } from "../course";

/**
 * defines which param an endpoint use, if any
 */
export const Params = z.object({
    catalog: z.boolean(),
    year: z.boolean(),
    session: z.boolean(),
});
export type Params = z.infer<typeof Params>;

const Endpoint = z.object({
    link: z.string().url(),
    params: Params.nullable(),
    // number of seconds between fetch
    interval: z.number().positive(),
    for: CourseFiles.keyof(),
});
export type Endpoint = z.infer<typeof Endpoint>;
