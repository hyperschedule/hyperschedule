import { SectionIdentifier, TermIdentifierString } from "./course";
import { z } from "zod";

export const UserSection = z.object({
    // placeholder attribute for future implementation of folders
    folder: z.string().nullable(),
    section: SectionIdentifier,
    attrs: z.object({
        selected: z.boolean(),
    }),
});
export type UserSection = z.infer<typeof UserSection>;

export const UserSchedule = z.object({
    terms: z.record(TermIdentifierString, UserSection.array()),
    activeTerm: TermIdentifierString,
});
export type UserSchedule = z.infer<typeof UserSchedule>;

export const GuestUser = z.object({
    _id: z.string().uuid(),
    schedule: UserSchedule,

    isGuest: z.literal(true),
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: z.number().positive(),
});
export type GuestUser = z.infer<typeof GuestUser>;

export const RegisteredUser = z.object({
    _id: z.string().uuid(),
    schedule: UserSchedule,

    isGuest: z.literal(false),
    // pomona id starts with 1 and pitzer id starts with 5, 8 digits
    cxid: z.number().min(10000000).max(59999999),
});
export type RegisteredUser = z.infer<typeof RegisteredUser>;

export const User = z.discriminatedUnion("isGuest", [
    RegisteredUser,
    GuestUser,
]);
export type User = z.infer<typeof User>;

export const UpdateScheduleOpAdd = z.object({
    op: z.literal("add"),
});
export type UpdateScheduleOpAdd = z.infer<typeof UpdateScheduleOpAdd>;

export const UpdateScheduleOpRemove = z.object({
    op: z.literal("remove"),
});
export type UpdateScheduleOpRemove = z.infer<typeof UpdateScheduleOpRemove>;

export const UpdateScheduleOpToggle = z.object({
    op: z.literal("toggle"),
    property: z.literal("selected"),
});
export type UpdateScheduleOpToggle = z.infer<typeof UpdateScheduleOpToggle>;

export const UpdateScheduleOp = z.discriminatedUnion("op", [
    UpdateScheduleOpToggle,
    UpdateScheduleOpAdd,
    UpdateScheduleOpRemove,
]);
export type UpdateScheduleOp = z.infer<typeof UpdateScheduleOp>;
