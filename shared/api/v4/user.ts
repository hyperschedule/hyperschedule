import type { SectionIdentifier } from "./course";

export interface UserSchedule {
    name: string;
    courses: { identifier: SectionIdentifier; selected: boolean }[];
    selected: boolean;
}

export interface GuestUser {
    uuid: string;
    isGuest: true;
    schedules: Record<string, UserSchedule>;
}

export interface AuthenticatedUser {
    uuid: string;
    isGuest: false;
    cxid: number;
    schedules: Record<string, UserSchedule>;
}

/**
 * All users are guaranteed to have uuid, isGuest, and schedules fields
 */
export type User = AuthenticatedUser | GuestUser;
