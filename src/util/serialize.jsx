import {List, Map, Set, fromJS} from "immutable";

import Mode from "@/App/mode";
import {computeSchedule} from "@/util/schedule";
import * as courseUtil from "@/util/course";

/**
 * Deserialize plain-JS course object into Immutable course state
 * object.

 * @param {Object} data Plain-JS ourse data object, as retrieved from
 * API, localStorage, import/export, etc.

 * @returns {Immutable.Map} Course data object as an Immutable map, to
 * be incorporated into the Immutable state object.
 */
export function deserializeCourse(data) {
  return fromJS(data);
}

/**
 * Serialize Immutable selection state object into plain-JS list of
 * course objects.

 * @param {Immutable.Map} selection Immutable selection state object,
 * as obtained from the global Redux state under the "selection" key,
 * representing the user's selected courses.

 * @return {Array} Plain-JS ordered array of Plain-JS course objects,
 * corresponding to the user's selected courses list, to be used in
 * import/export, localStorage, etc.  Each course object also includes
 * a "starred" and "selected" key in addition to the default API-spec
 * keys, corresponding to whether the course is starred and checked
 * (respectively) in the selected courses list.

 * Note that the serialized output is still a JS object and must be
 * JSON-stringified before being used in import/export, localStorage,
 * etc.
 */
export function serializeSelection(selection) {
  const courses = selection.get("courses");
  const order = selection.get("order");
  const starred = selection.get("starred");
  const checked = selection.get("checked");

  return order.map(key =>
    courses.get(key).merge({
      starred: starred.has(key),
      selected: checked.has(key),
    }),
  );
}

/**
 * Deserialize selected courses list from plain-JS list of course
 * objects to Immutable selection state object.
 *
 * @param {Array} data Plain-JS list of courses, corresponding to the
 * user's selected courses list, as obtained from import/export,
 * localStorage, etc.
 *
 * Note that localStorage, import/export, etc. store JSON-stringified
 * data which must be first JSON-parsed into a plain JS object before
 * it is passed to this function for deserialization.

 * @return {Immutable.Map} Immutable selection state object,
 * representing the user's selected courses, to be incorporated into
 * the global Redux state under the "selection" key.
 */
export function deserializeSelection(data) {
  let courses = Map();
  let order = List();
  let starred = Set();
  let checked = Set();

  for (const {
    starred: courseStarred,
    selected: courseChecked,
    ...courseData
  } of data) {
    const course = deserializeCourse(courseData);

    const key = courseUtil.courseKey(course);
    courses = courses.set(key, course);
    order = order.push(key);

    if (courseStarred) {
      starred = starred.add(key);
    }
    if (courseChecked) {
      checked = checked.add(key);
    }
  }

  return Map({
    courses,
    order,
    starred,
    checked,
  });
}

export function serializeAPIStorage(api) {
  const courses = api.get("courses");

  return {
    courseList: api
      .get("order")
      .map(key => courses.get(key))
      .toJS(),
    courseDataTimestamp: api.get("timestamp"),
  };
}

export function deserializeAPIStorage({
  courseList = [],
  courseDataTimestamp = 0,
}) {
  const {courses, order} = courseList.reduce(
    ({courses, order}, courseJS) => {
      const course = fromJS(courseJS);
      const key = courseUtil.courseKey(course);
      return {
        courses: courses.set(key, course),
        order: order.push(key),
      };
    },
    {
      courses: Map(),
      order: List(),
    },
  );

  const timestamp = courseDataTimestamp;

  return Map({
    courses,
    order,
    timestamp,
  });
}

export function serializeModeStorage(mode) {
  return {
    scheduleTabSelected: mode === Mode.SCHEDULE,
  };
}

export function deserializeModeStorage({
  scheduleTabSelected = false,
}) {
  if (scheduleTabSelected) {
    return Mode.SCHEDULE;
  } else {
    return Mode.COURSE_SEARCH;
  }
}

export function serializeSelectionStorage(selection) {
  return {
    selectedCourses: serializeSelection(selection),
  };
}

export function deserializeSelectionStorage({selectedCourses = []}) {
  return deserializeSelection(selectedCourses);
}

export function deserializeStorage(storage) {
  const data = {};
  for (const key of Object.keys(storage)) {
    data[key] = JSON.parse(storage.getItem(key));
  }

  const selection = deserializeSelectionStorage(data);

  return Map({
    api: deserializeAPIStorage(data),
    mode: deserializeModeStorage(data),
    selection: selection,
    schedule: computeSchedule(selection),
  });
}

export function updateStorage(storage, data) {
  for (const key in data) {
    storage.setItem(key, JSON.stringify(data[key]));
  }
}
