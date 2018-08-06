import { call, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { HyperscheduleApi } from './api';
import * as util from '@/util/hyperschedule-util';
import { updateCourses } from './actions';
import {OrderedMap, fromJS} from 'immutable';

const API_UPDATE_PERIOD_MS = 1000 * 30;


function* periodicApiUpdate(getState) {
  for (;;) {
    // Fetch the response from the API and emit an action to update the state
    const response = yield call(HyperscheduleApi.fetch_courses);
    let courses = OrderedMap();
    for (const data of response.courses) {
      const course = new util.deserializeCourse(data);
      courses = courses.set(util.courseKey(course), course);
    }
    
    yield put(updateCourses(courses));

    // Wait for API_UPDATE_PERIOD_MS before next API fetch
    yield call(delay, API_UPDATE_PERIOD_MS);
  }
}

export default periodicApiUpdate;
