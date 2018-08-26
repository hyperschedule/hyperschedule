import {List, Map, Set, fromJS} from "immutable";

import Mode from "@/App/mode";
import {computeSchedule} from "@/util/schedule";
import * as courseUtil from "@/util/course";

/**
 * Deserialize plain-JS course object into Immutable course state
 * object.

 * @param {Object} data Plain-JS course data object to be serialized,
 * as retrieved from API, localStorage, import/export, etc.

 * @returns {Immutable.Map} Deserialized course data object as an
 * Immutable map, to be incorporated into the Immutable state object.
 */
export function deserializeCourse(data) {
  return fromJS(data);
}

/**
 * Serialize Immutable selection state object into plain-JS list of
 * course objects.

 * @param {Immutable.Map} selection Immutable selection state object
 * to be serialized, as obtained from the global Redux state under the
 * "selection" key, representing the user's selected courses.

 * @returns {Array} Serialized array of plain-JS course objects,
 * corresponding to the user's selected courses list in-order, to be
 * used in import/export, localStorage, etc.  Each course object also
 * includes a "starred" and "selected" key in addition to the default
 * API-spec keys, corresponding to whether the course is starred and
 * checked (respectively) in the selected courses list.

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
 * @param {Array} data Plain-JS list of courses to be serialized,
 * corresponding to the user's selected courses list, as obtained from
 * import/export, localStorage, etc.
 *
 * Note that localStorage, import/export, etc. store JSON-stringified
 * data which must be first JSON-parsed into a plain JS object before
 * it can be deserialized.

 * @return {Immutable.Map} Deserialized selection state object,
 * representing the user's selected courses, to be incorporated into
 * the global Redux state under the "selection" key.
 */
export function deserializeSelection(data) {
  const init = {
    courses: Map(),
    order: List(),
    starred: Set(),
    checked: Set(),
  };

  return Map(
    data.reduce(
      (
        {courses, order, starred, checked},
        {
          starred: courseStarred,
          selected: courseChecked,
          ...courseData
        },
      ) => {
        const course = deserializeCourse(courseData);
        const key = courseUtil.courseKey(course);

        return {
          courses: courses.set(key, course),
          order: order.push(key),
          starred: courseStarred ? starred.add(key) : starred,
          checked: courseChecked ? checked.add(key) : checked,
        };
      },
      init,
    ),
  );
}

/**
 * Serialize Immutable API state for localStorage.
 *
 * @param {Immutable.Map} api Immutable API state, stored in the
 * global Redux state under the "api" key.
 *
 * @returns {Object} Serialized API storage object whose keys
 * correspond to localStorage keys and values correspond to plain-JS
 * objects to be JSON-stringified and then saved to localStorage.
 *
 * Note that the serialized output is still a JS object and must be
 * JSON-stringified before it can be saved to localStorage, which
 * accepts only string entries.
 */
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

/**
 * Deserialize API state from localStorage.
 *
 * @param {Object} data localStorage data, with keys corresponding to
 * localStorage keys and values corresponding to JSON-parsed
 * localStorage data entries.
 *
 * Note that, since localStorage only stores string data, entries
 * restored from localStorage must be JSON-parsed into a JS object
 * first before it can be deserialized.
 *
 * @returns {Immutable.Map} Deserialized API state object as an
 * Immutable map, to be stored in the global Redux state under the
 * "api" key.
 */
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

/**
 * Serialize app mode (schedule / course search), or tab state, for
 * localStorage.
 *
 * @param {String} mode Currently focused mode (tab) name, to be
 * retrieved from the global Redux state under the "mode" key.
 * @see {@link module:App/mode} for mode name definitions.
 *
 * @returns {Object} Serialized mode storage object whose keys
 * correspond to localStorage keys and values correspond to plain-JS
 * objects to be JSON-stringified and then saved to localStorage.
 *
 * Note that the serialized output is still a JS object and must be
 * JSON-stringified before it can be saved to localStorage, which
 * accepts only string entries.
 */
export function serializeModeStorage(mode) {
  return {
    scheduleTabSelected: mode === Mode.SCHEDULE,
  };
}

/**
 * Deserialize app mode (tab state) from localStorage.
 *
 * @param {Object} data localStorage data, with keys corresponding to
 * localStorage keys and values corresponding to JSON-parsed
 * localStorage data entries.
 *
 * Note that, since localStorage only stores string data, entries
 * restored from localStorage must be JSON-parsed into a JS object
 * first before it can be deserialized.
 *
 * @returns {String} Deserialized mode (tab) state name, to be stored
 * in the global Redux state under the "mode" key.
 * @see {@link module:App/mode} for mode name definitions.
 */
export function deserializeModeStorage({
  scheduleTabSelected = false,
}) {
  if (scheduleTabSelected) {
    return Mode.SCHEDULE;
  } else {
    return Mode.COURSE_SEARCH;
  }
}

/**
 * Serialize the user's selected course list for localStorage.
 *
 * This is a thin wrapper around the serializeSelection function that
 * merely stores the serialized selection object under the correct
 * localStorage "selectedCourses" key.
 * @see serializeSelection
 *
 * @param {Immutable.Map} selection Immutable selection state object
 * to be serialized, as obtained from the global Redux state under the
 * "selection" key, representing the user's selected courses.
 *
 * @returns {Object} Serialized selected-courses storage object whose
 * keys correspond to localStorage keys and values correspond to
 * plain-JS objects to be JSON-stringified and then saved to
 * localStorage.
 *
 * Note that the serialized output is still a JS object and must be
 * JSON-stringified before it can be saved to localStorage, which
 * accepts only string entries.
 */
export function serializeSelectionStorage(selection) {
  return {
    selectedCourses: serializeSelection(selection),
  };
}

/**
 * Deserialize selected courses list from plain-JS list of course
 * objects to Immutable selection state object.
 *
 * This is a thin wrapper around the deserializeSelection function
 * that merely retrieves the correct entry from localStorage (under
 * the "selectedCourses" key) before deserializing.
 * @see deserializeSelection
 *
 * @param {Array} data localStorage data, with keys corresponding to
 * localStorage keys and values corresponding to JSON-parsed
 * localStorage data entries.
 *
 * Note that, since localStorage only stores string data, entries
 * restored from localStorage must be JSON-parsed into a JS object
 * first before it can be deserialized.
 *
 * @returns {Immutable.Map} Deserialized selection state object,
 * representing the user's selected courses, to be incorporated into
 * the global Redux state under the "selection" key.
 */
export function deserializeSelectionStorage({selectedCourses = []}) {
  return deserializeSelection(selectedCourses);
}

/**
 * Extracts relevant Redux state variables and deserializes them from
 * localStorage.
 *
 * @param {Storage} storage localStorage object, or any object
 * adhering to the Storage API, containing serialized state variables
 * used to extract saved user state.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}.
 *
 * @returns {Immutable.Map} Deserialized (partial) state object, to be
 * used as the initial Redux state based on saved/cached user data.
 */
export function extractStateStorage(storage) {
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

/**
 * JSON-stringifies and merges entries into localStorage.
 *
 * This is a convenience function used to automatically JSON-stringify
 * various serialized storage objects before merging them into
 * localStorage.
 *
 * @param {Storage} storage localStorage object, or any object
 * adhering to the Storage API, into which entries will be merged.
 *
 * @param {Object} data localStorage data object whose keys correspond
 * to localStorage keys and values correspond to plain-JS objects to
 * be JSON-stringified and then saved to localStorage.
 */
export function updateStorage(storage, data) {
  for (const key in data) {
    storage.setItem(key, JSON.stringify(data[key]));
  }
}
