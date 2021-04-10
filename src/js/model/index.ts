import * as Course from "@hyperschedule/lib/course";

interface Model {
  apiCourses: Map<string, Course.CourseV3>;
  readonly selectedKeyOrder: string[];
  readonly selectedKeySet: Set<string>;
}

const model: Model = {
  apiCourses: new Map(),
  selectedKeyOrder: [],
  selectedKeySet: new Set(),
};
