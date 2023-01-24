import { SectionIdentifier } from "./course";
import { z } from "zod";

// special folder names for sections without a folder
// this folder cannot be hidden. This is not using zod
// because it doesn't quite work as a computed property
// on objects
export const NoFolder = "__none__" as const;
export type NoFolder = typeof NoFolder;

export const Folder = z.object({
    name: z.string(),
    hidden: z.boolean(),
    sections: z
        .object({ identifier: SectionIdentifier, hidden: z.boolean() })
        .array(),
});
export type Folder = z.infer<typeof Folder>;

const TermIdentifierString = z
    .string()
    .regex(/^(?<term>FA|SP|SU)(?<year>\d{4})$/);
export type TermIdentifierString = z.infer<typeof TermIdentifierString>;

const FolderName = z.string();
export type FolderName = z.infer<typeof FolderName>;

export const UserSchedule = z.object({
    terms: z.record(TermIdentifierString, z.record(FolderName, Folder)),
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

export const LoginUser = z.object({
    _id: z.string().uuid(),
    schedule: UserSchedule,

    isGuest: z.literal(false),
    // pomona id starts with 1 and pitzer id starts with 5, 8 digits
    cxid: z.number().min(10000000).max(59999999),
});
export type LoginUser = z.infer<typeof LoginUser>;

export const User = z.discriminatedUnion("isGuest", [LoginUser, GuestUser]);
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
    property: z.literal("visibility"),
});
export type UpdateScheduleOpToggle = z.infer<typeof UpdateScheduleOpToggle>;

export const UpdateScheduleOpMove = z.object({
    op: z.literal("move"),
    dst: FolderName,
});
export type UpdateScheduleOpMove = z.infer<typeof UpdateScheduleOpMove>;

export const UpdateScheduleOp = z.discriminatedUnion("op", [
    UpdateScheduleOpMove,
    UpdateScheduleOpToggle,
    UpdateScheduleOpAdd,
    UpdateScheduleOpRemove,
]);
export type UpdateScheduleOp = z.infer<typeof UpdateScheduleOp>;
