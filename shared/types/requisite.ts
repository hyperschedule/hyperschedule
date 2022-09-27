import { Term } from "./course";

export type LogicType = "AND" | "OR" | "NOT";
export type RequisiteType = "Pre" | "Co";

export type Requisite = {
    course: string;
    term: Term;
    year: number;
    logicGroup: LogicGroup | null;
};

type RequisiteCourse = {
    type: "Requisite";
    requisiteType: RequisiteType;
    courseCode: string;
};

type SectionRequirement = {
    type: "Section";
    info: string;
};

export type LogicGroup = {
    type: "LogicGroup";
    logicType: LogicType;
    items: LogicGroupItem[];
};

type LogicGroupItem = LogicGroup | RequisiteCourse | SectionRequirement;
