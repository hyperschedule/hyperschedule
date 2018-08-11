import {call, put, select} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import * as api from './api';

import * as util from '@/util/hyperschedule-util';

import * as actions from './actions';
import {Map, OrderedMap, fromJS} from 'immutable';

const API_UPDATE_PERIOD_MS = 1000 * 30;

function* periodicApiUpdate() {
  //const {courses, timestamp} = yield call(api.allCourses);
  //yield put(actions.allCourses(courses, timestamp));

  for (;;) {
    const prevTimestamp = yield select(state => state.getIn(['api', 'timestamp']));
    const {
      incremental, courses, diff, timestamp,
    } = yield call(api.coursesSince, prevTimestamp);

    if (incremental) {
      yield put(actions.coursesSince(diff, timestamp));
    } else {
      yield put(actions.allCourses(courses, timestamp));
    }

    yield call(delay, API_UPDATE_PERIOD_MS);
  }
}

export default periodicApiUpdate;
