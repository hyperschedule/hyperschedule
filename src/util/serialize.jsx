import {List, Map, Set, fromJS} from 'immutable';

import Mode from '@/App/mode';
import * as courseUtil from '@/util/course';

export function deserializeCourse(data) {
  return fromJS(data);
}

export function serializeSelection(selection) {
  const courses = selection.get('courses');
  const order = selection.get('order');
  const starred = selection.get('starred');
  const checked = selection.get('checked');

  return order.map(key =>
    courses.get(key).merge({
      starred: starred.has(key),
      selected: checked.has(key),
    }),
  );
}

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
    courses = courses.set(key, fromJS(course));
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
  const courses = api.get('courses');

  return {
    courseList: api
      .get('order')
      .map(key => courses.get(key))
      .toJS(),
    courseDataTimestamp: api.get('timestamp'),
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

  return Map({
    api: deserializeAPIStorage(data),
    mode: deserializeModeStorage(data),
    selection: deserializeSelectionStorage(data),
  });
}

export function updateStorage(storage, data) {
  for (const key in data) {
    storage.setItem(key, JSON.stringify(data[key]));
  }
}
