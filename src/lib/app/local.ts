import * as Store from "svelte/store";
import * as Course from "@hyperschedule/lib/course";
import * as SortKey from "@hyperschedule/lib/sort-key";

type Weekday = "U" | "M" | "T" | "W" | "R" | "F" | "S";

interface Term {
  termCode: string;
  termSortKey: SortKey.SortKey;
  termName: string;
}

export interface ApiData {
  data: {
    terms: Record<string, Term>;
    courses: Record<string, Course.CourseV3>;
  };
  until: number;
}

const make = <T>(
  key: string,
  def: T,
  validate: (init: unknown) => T | null
) => {
  const initJson =
    typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  const init = (initJson ? validate(JSON.parse(initJson)) : null) ?? def;
  const store = Store.writable(init);
  // todo maybe unsubscribe, who cares
  store.subscribe((data) => {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(key, JSON.stringify(data));
  });
  return store;
};

// TODO improve type validation
const validateBool = (data: unknown) =>
  typeof data === "boolean" ? data : null;

// stores

export const apiData = make("apiData", null, (data) => {
  if (typeof data !== "object" || data === null) return null;
  return <ApiData | null>data;
});
export const selectedCourses = make("selectedCourses", [], (data) => {
  if (!Array.isArray(data)) return null;
  return <Course.CourseV3[]>data;
});
export const showClosedCourses = make("showClosedCourses", true, validateBool);
export const hideAllConflictingCourses = make(
  "hideAllConflictingCourses",
  false,
  validateBool
);
export const hideStarredConflictingCourses = make(
  "hideStarredConflictingCourses",
  false,
  validateBool
);
