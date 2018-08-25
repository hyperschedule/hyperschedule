import {call, fork, put, select, takeEvery} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import Mode from '@/App/mode';

import * as api from './api';

import * as serializeUtil from '@/util/serialize';

import * as actions from './actions';

const API_UPDATE_PERIOD_MS = 1000 * 30;

function* periodicAPI() {
  //const {courses, timestamp} = yield call(api.allCourses);
  //yield put(actions.allCourses(courses, timestamp));

  for (;;) {
    const prevTimestamp = yield select(state =>
      state.getIn(['api', 'timestamp']),
    );
    const {incremental, courses, diff, timestamp} = yield call(
      api.coursesSince,
      prevTimestamp,
    );

    if (incremental) {
      yield put(actions.coursesSince(diff, timestamp));
    } else {
      yield put(actions.allCourses(courses, timestamp));
    }

    yield call(delay, API_UPDATE_PERIOD_MS);
  }
}

function* persistAPI() {
  const api = yield select(state => state.get('api'));

  const courses = api.get('courses');
  const data = api
    .get('order')
    .map(key => courses.get(key))
    .toJS();

  localStorage.setItem('courseList', JSON.stringify(data));

  localStorage.setItem(
    'courseDataTimestamp',
    JSON.stringify(api.get('timestamp')),
  );
}

function* persistMode() {
  const mode = yield select(state => state.get('mode'));
  localStorage.setItem(
    'scheduleTabSelected',
    JSON.stringify(mode === Mode.SCHEDULE),
  );
}

function* persistSelection() {
  const selection = yield select(state => state.get('selection'));
  localStorage.setItem(
    'selectedCourses',
    JSON.stringify(serializeUtil.serializeSelection(selection)),
  );
}

export default function*() {
  yield fork(periodicAPI);

  yield takeEvery(
    [actions.ALL_COURSES, actions.COURSES_SINCE],
    persistAPI,
  );
  yield takeEvery([actions.modeSelector.SET_MODE], persistMode);
  yield takeEvery(
    [
      actions.courseSearch.ADD_COURSE,
      actions.selectedCourses.REMOVE_COURSE,
      actions.selectedCourses.TOGGLE_COURSE_CHECKED,
      actions.selectedCourses.TOGGLE_COURSE_STARRED,
    ],
    persistSelection,
  );
}
