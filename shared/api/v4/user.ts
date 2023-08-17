import { SchoolEnum, SectionIdentifier, TermIdentifier } from "./course";
import * as APIv3 from "../v3";
import { z } from "zod";

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
    _id: z.string(),
    isActive: z.boolean(),
    term: TermIdentifier,
    name: z.string(),
    sections: UserSection.array(),
});
export type UserSchedule = z.infer<typeof UserSchedule>;

const UserData = z.object({
    _id: z.string(),
    schedules: UserSchedule.array().min(1).max(100),
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: z.number().positive(),
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
    scheduleId: z.string(),
});
export type AddScheduleResponse = z.infer<typeof AddScheduleResponse>;

export const DeleteScheduleRequest = AddScheduleResponse;
export type DeleteScheduleRequest = AddScheduleResponse;

export const AddSectionRequest = z.object({
    scheduleId: z.string(),
    section: SectionIdentifier,
});
export type AddSectionRequest = z.infer<typeof AddSectionRequest>;

export const DeleteSectionRequest = AddSectionRequest;
export type DeleteSectionResponse = AddSectionRequest;

export const SetSectionAttrRequest = z.object({
    scheduleId: z.string(),
    section: SectionIdentifier,
    attrs: UserSectionAttrs,
});
export type SetSectionAttrRequest = z.infer<typeof SetSectionAttrRequest>;

export const ImportV3Request = z.object({
    courses: z.string().array().nonempty(),
});
export type ImportV3Request = z.infer<typeof ImportV3Request>;
