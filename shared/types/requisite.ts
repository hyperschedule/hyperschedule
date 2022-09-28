import type { CourseIdentifier } from "./course";

export enum LogicType {
  and = "AND",
  or = "OR",
  not = "NOT"
}

export enum RequisiteType {
  prerequisite = "pre",
  corequisite = "co"
}

/**
 * The requisite for a course is effectively a tree where the {@link Requisite}
 * is the root node. We store an extra copy of the course ID for future reverse
 * course look-up by requisites. Here is an example requisite:
 * ```typescript
 * const example: Requisite = {
 *   courseId: {
 *     courseCode: "CSCI081",
 *     school: School.HMC,
 *     sectionNumber: 2,
 *     year: 2022,
 *     term: Term.fall
 *   },
 *   logicGroup: {
 *     type: "LogicGroup",
 *     condition: LogicType.and,
 *     items: [
 *       {
 *         type: "Section",
 *         info: "Instructor permission required."
 *       },
 *       {
 *         type: "Section",
 *         info: "Computer science (including CS, joint CS/math, and mathematical\
 *         /computational biology) majors at HMC only. All others by permission."
 *       },
 *       {
 *         type: "LogicGroup",
 *         condition: LogicType.or,
 *         items: [
 *           {
 *             type: "LogicGroup",
 *             condition: LogicType.and,
 *             items: [
 *               {
 *                 type: "Requisite",
 *                 requisiteType: RequisiteType.prerequisite,
 *                 courseCode: "MATH055 HM"
 *               },
 *               {
 *                 type: "Requisite",
 *                 requisiteType: RequisiteType.prerequisite,
 *                 courseCode: "CSCI060 HM"
 *               }
 *             ]
 *           },
 *           {
 *             type: "LogicGroup",
 *             condition: LogicType.and,
 *             items: [
 *               {
 *                 type: "Requisite",
 *                 requisiteType: RequisiteType.prerequisite,
 *                 courseCode: "MATH055 HM"
 *               },
 *               {
 *                 type: "Requisite",
 *                 requisiteType: RequisiteType.prerequisite,
 *                 courseCode: "CSCI042 HM"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * };
 * ```
 */
export interface Requisite {
  courseId: CourseIdentifier;
  logicGroup: LogicGroup | null;
}

export interface RequisiteCourse {
  type: "Requisite";
  requisiteType: RequisiteType;
  /**
   * We only store the course code instead of the full course identifier because
   * requisite conditions are applied across semesters. This is in portal format,
   * e.g. `CSCI001 HM`.
   */
  courseCode: string;
}

/**
 * This is the special "Section Requirement" field as appears on portal. This
 * can contain arbitrary texts, such as
 *
 * - "Instructor permission required"
 * - "HM only, all other by PERM"
 * - "First year only"
 */
export interface SectionRequirement {
  type: "Section";
  info: string;
}

/**
 * This is a node of the requisite tree. The logic condition is applied to
 * all `items` individually.
 */
export interface LogicGroup {
  type: "LogicGroup";

  condition: LogicType;
  /**
   * If the logic type is NOT, then there should only be one item in this array.
   * We use an array with a single item so we don't have to define a different
   * type -- it's gonna take an extra `if` clause anyway.
   */
  items: LogicGroupItem[];

}

export type LogicGroupItem = LogicGroup | RequisiteCourse | SectionRequirement;

