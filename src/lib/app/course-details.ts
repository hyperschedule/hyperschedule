import * as Store from "svelte/store";
import * as Course from "@hyperschedule/lib/course";

export const course: Store.Writable<Course.CourseV3 | null> = Store.writable(
  null
);
