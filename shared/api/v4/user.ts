import { SchoolEnum, SectionIdentifier, TermIdentifier } from "./course";
import { z } from "zod";

export const UserId = z.string().regex(/u~[A-Za-z0-9\-_]{22}/);
export const ScheduleId = z.string().regex(/s~[A-Za-z0-9\-_]{22}/);
export type UserId = z.infer<typeof UserId>;
export type ScheduleId = z.infer<typeof ScheduleId>;

export const UserSectionAttrs = z.object({
    selected: z.boolean(),
});
export type UserSectionAttrs = z.infer<typeof UserSectionAttrs>;

export const UserSection = z.object({
    section: SectionIdentifier,
    attrs: UserSectionAttrs,
});
export type UserSection = z.infer<typeof UserSection>;

export const UserSchedule = z.object({
    term: TermIdentifier,
    name: z.string(),
    sections: UserSection.array(),
});
export type UserSchedule = z.infer<typeof UserSchedule>;

const UserData = z.object({
    _id: UserId,
    schedules: z.record(ScheduleId, UserSchedule),
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: z.number().positive(),
    // id of the active schedule. null if no active schedule is set
    activeSchedule: z.string().nullable(),
});

export const GuestUser = UserData.merge(
    z.object({
        isGuest: z.literal(true),
    }),
);
export type GuestUser = z.infer<typeof GuestUser>;

export const RegisteredUser = UserData.merge(
    z.object({
        isGuest: z.literal(false),
        eppn: z.string(),
        school: SchoolEnum,
    }),
);
export type RegisteredUser = z.infer<typeof RegisteredUser>;

export const User = z.discriminatedUnion("isGuest", [
    RegisteredUser,
    GuestUser,
]);
export type User = z.infer<typeof User>;

export const AddScheduleRequest = z.object({
    term: TermIdentifier,
    name: z.string(),
});
export type AddScheduleRequest = z.infer<typeof AddScheduleRequest>;
export const RenameScheduleRequest = z.object({
    scheduleId: z.string(),
    name: z.string(),
});
export type RenameScheduleRequest = z.infer<typeof RenameScheduleRequest>;

export const AddScheduleResponse = z.object({
    scheduleId: ScheduleId,
});
export type AddScheduleResponse = z.infer<typeof AddScheduleResponse>;

export const DeleteScheduleRequest = AddScheduleResponse;
export type DeleteScheduleRequest = AddScheduleResponse;

export const AddSectionRequest = z.object({
    scheduleId: ScheduleId,
    section: SectionIdentifier,
});
export type AddSectionRequest = z.infer<typeof AddSectionRequest>;

export const DeleteSectionRequest = AddSectionRequest;
export type DeleteSectionResponse = AddSectionRequest;

export const SetSectionAttrRequest = z.object({
    scheduleId: ScheduleId,
    section: SectionIdentifier,
    attrs: UserSectionAttrs,
});
export type SetSectionAttrRequest = z.infer<typeof SetSectionAttrRequest>;

export const ImportV3Request = z.object({
    courses: z
        .object({
            code: z.string(),
            selected: z.boolean(),
        })
        .array(),
});
export type ImportV3Request = z.infer<typeof ImportV3Request>;
export const ImportV3Response = z.object({
    scheduleId: ScheduleId,
});
export type ImportV3Response = z.infer<typeof ImportV3Response>;

export const SetActiveScheduleRequest = z.object({
    scheduleId: ScheduleId,
});
export type SetActiveScheduleRequest = z.infer<typeof SetActiveScheduleRequest>;

export const ReplaceSectionsRequest = z.object({
    scheduleId: ScheduleId,
    sections: UserSection.array(),
});
export type ReplaceSectionsRequest = z.infer<typeof ReplaceSectionsRequest>;
