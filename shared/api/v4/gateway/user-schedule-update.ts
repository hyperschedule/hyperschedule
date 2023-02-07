import { z } from "zod";
import { SectionIdentifier } from "../course";
import { UserSection } from "../user";

export namespace UserScheduleUpdate {
    export const Remove = z.object({
        op: z.literal("remove"),
        target: SectionIdentifier,
    });

    export const Add = z.object({
        op: z.literal("add"),
        target: SectionIdentifier,
    });

    export const Replace = z.object({
        op: z.literal("replace"),
        target: SectionIdentifier,
        obj: UserSection.omit({ section: true }),
    });

    export const Op = z.discriminatedUnion("op", [Add, Remove, Replace]);

    export type Remove = z.infer<typeof Remove>;
    export type Add = z.infer<typeof Add>;
    export type Replace = z.infer<typeof Replace>;
    export type Op = z.infer<typeof Op>;
}
