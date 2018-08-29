import {List, Map, Set} from "immutable";
import {combineReducers} from "redux-immutable";

import * as actions from "./actions";

import Mode from "@/App/mode";

import importExport from "./App/Popup/ImportExport/reducers";
import popup from "./App/Popup/reducers";
import search from "./App/CourseSearch/reducers";

import * as courseUtil from "@/util/course";
import * as scheduleUtil from "@/util/schedule";
import * as serializeUtil from "@/util/serialize";

const mode = (state = Mode.COURSE_SEARCH, action) =>
  action.type === actions.modeSelector.SET_MODE ? action.mode : state;

const selectionInitial = Map({
  courses: Map(),
  order: List(),
  checked: Set(),
  starred: Set(),
});
const selection = (prev = Map(), action) => {
  const state = selectionInitial.merge(prev);
  const courses = state.get("courses"),
    order = state.get("order"),
    checked = state.get("checked"),
    starred = state.get("starred");

  switch (action.type) {
    case actions.courseSearch.ADD_COURSE:
      if (courses.has(action.key)) {
        return state;
      }

      return state.merge({
        order: order.push(action.key),
        checked: checked.add(action.key),
      });

    case actions.selectedCourses.REORDER: {
      const key = order.get(action.from);
      return state.set(
        "order",
        order.delete(action.from).insert(action.to, key),
      );
    }
    case actions.selectedCourses.REMOVE_COURSE: {
      return state.merge({
        order: order.filter(courseKey => courseKey !== action.key),
        courses: courses.delete(action.key),
      });
    }
    case actions.selectedCourses.TOGGLE_COURSE_CHECKED: {
      if (checked.has(action.key)) {
        return state.set("checked", checked.delete(action.key));
      } else {
        return state.set("checked", checked.add(action.key));
      }
    }
    case actions.selectedCourses.TOGGLE_COURSE_STARRED: {
      if (starred.has(action.key)) {
        return state.set("starred", starred.delete(action.key));
      } else {
        return state.set("starred", starred.add(action.key));
      }
    }
    default:
      return state;
  }
};

const schedule = (state = Set()) => state;
const focus = (state = Map()) => state;

const apiInitial = Map({
  courses: Map(),
  order: List(),
  timestamp: 0,
});
function api(prev = Map(), action) {
  const state = apiInitial.merge(prev);

  switch (action.type) {
    case actions.ALL_COURSES: {
      let courses = Map();

      for (const data of action.courses) {
        const course = serializeUtil.deserializeCourse(data);
        courses = courses.set(courseUtil.courseKey(course), course);
      }

      const order = courses
        .keySeq()
        .sort((keyA, keyB) =>
          courseUtil.coursesSortCompare(
            courses.get(keyA),
            courses.get(keyB),
          ),
        )
        .toList();

      return state.merge({
        courses,
        order,
        timestamp: action.timestamp,
      });
    }

    case actions.COURSES_SINCE: {
      let courses = state.get("courses");
      let order = state.get("order");
      const {added, removed, modified} = action.diff;

      // todo: replace dumb linear search with binary search
      for (const data of removed) {
        const course = serializeUtil.deserializeCourse(data);
        const removedKey = courseUtil.courseKey(course);

        order = order.filter(key => key !== removedKey);
        courses = courses.delete(removedKey);
      }

      // todo: use binary insertion
      for (const data of added) {
        const course = serializeUtil.deserializeCourse(data);
        const addedKey = courseUtil.courseKey(course);

        order = order.push(addedKey);
        courses = courses.set(addedKey, course);
      }
      order = order.sort((keyA, keyB) =>
        courseUtil.coursesSortCompare(
          courses.get(keyA),
          courses.get(keyB),
        ),
      );

      for (const data of modified) {
        const course = serializeUtil.deserializeCourse(data);
        const key = courseUtil.courseKey(course);

        courses = courses.mergeDeepIn([key], course);
      }

      return state.merge({
        courses,
        order,
        timestamp: action.timestamp,
      });
    }

    default:
      return state;
  }
}

const app = combineReducers({
  mode,
  search,
  focus,
  selection,
  schedule,
  popup,
  importExport,
  api,
});

export default (prev = Map(), action) => {
  const state = app(prev, action);

  switch (action.type) {
    case actions.controls.SHOW_IMPORT_EXPORT:
      return state.setIn(
        ["importExport", "data"],
        JSON.stringify(
          serializeUtil.serializeSelection(state.get("selection")),
        ),
      );

    case actions.importExport.APPLY_DATA: {
      const selection = serializeUtil.deserializeSelection(
        JSON.parse(state.getIn(["importExport", "data"])),
      );
      return state.merge({
        selection,
        schedule: scheduleUtil.computeSchedule(selection),
      });
    }

    case actions.courseSearch.FOCUS_COURSE:
      return state.set(
        "focus",
        state.getIn(["api", "courses", action.key]),
      );

    case actions.selectedCourses.FOCUS_COURSE:
    case actions.schedule.FOCUS_COURSE:
      return state.set(
        "focus",
        state.getIn(["selection", "courses", action.key]),
      );

    case actions.courseSearch.ADD_COURSE: {
      const courses = state.getIn(["api", "courses"]);
      const selection = state
        .get("selection")
        .setIn(["courses", action.key], courses.get(action.key));
      return state.merge({
        selection,
        schedule: scheduleUtil.computeSchedule(selection),
      });
    }
    case actions.selectedCourses.REORDER:
    case actions.selectedCourses.REMOVE_COURSE:
    case actions.selectedCourses.TOGGLE_COURSE_CHECKED:
    case actions.selectedCourses.TOGGLE_COURSE_STARRED: {
      const selection = state.get("selection");
      return state.set(
        "schedule",
        scheduleUtil.computeSchedule(selection),
      );
    }

    case actions.ALL_COURSES:
    case actions.COURSES_SINCE: {
      const apiCourses = state.getIn(["api", "courses"]);
      const selectionCourses = state.getIn(["selection", "courses"]);

      return state.setIn(
        ["selection", "courses"],
        selectionCourses.map(
          (course, key) =>
            apiCourses.has(key)
              ? course.mergeDeep(apiCourses.get(key))
              : course,
        ),
      );
    }

    default:
      return state;
  }
};
