import type { SectionIdentifier } from "./course";

// special folder names for sections without a folder
// this folder cannot be hidden
export const NoFolder = "__none__" as const;
export type NoFolder = typeof NoFolder;

export interface DefaultFolder {
    name: NoFolder;
    hidden: false;
    sections: { identifier: SectionIdentifier; hidden: boolean }[];
}

export interface CustomFolder {
    name: string;
    hidden: boolean;
    sections: { identifier: SectionIdentifier; hidden: boolean }[];
}

export type Folder = DefaultFolder | CustomFolder;

type TermIdentifierString = string;
type FolderName = string;

export interface GuestUserAuth {
    isGuest: true;
    // seconds since Unix epoch. used to pruning inactive users.
    // this is only updated if the user did any modification to their schedule
    lastModified: number;
}

export interface LoginUserAuth {
    isGuest: false;
    cxid: number;
}

export interface User<T extends GuestUserAuth | LoginUserAuth> {
    _id: string;
    schedules: Record<TermIdentifierString, Record<FolderName, Folder>>;
    activeTerm: TermIdentifierString;
    auth: T;
}

export type GenericUser = User<GuestUserAuth | LoginUserAuth>;
