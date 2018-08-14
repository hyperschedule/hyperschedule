import {fromJS, List, Map, Set} from 'immutable';

import * as courseUtil from '@/util/course';

export function deserializeCourse(data) {
  return fromJS(data);
}

export function serializeSelection(selection) {
  const courses = selection.get('courses');
  const order = selection.get('order');
  const starred = selection.get('starred');
  const checked = selection.get('checked');

  return order.map(key => courses.get(key).merge({
    starred: starred.has(key),
    selected: checked.has(key),
  }));
};

export function deserializeSelection(data) {
  let courses = Map();
  let order = List();
  let starred = Set();
  let checked = Set();

  for (const {
    starred: courseStarred,
    selected: courseChecked,
    ...courseData,
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
    courses, order, starred, checked,
  });
}
