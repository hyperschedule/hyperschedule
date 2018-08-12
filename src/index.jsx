import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';

import sagas from './sagas';
import createSagaMiddleware from 'redux-saga';

import persistState from 'redux-localstorage';
import {createLogger} from 'redux-logger';

import {fromJS, Map} from 'immutable';

import App from './App/App';

import hyperschedule from './reducers';

import * as actions from './actions';

import Mode from '@/App/mode';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  hyperschedule,
  Map(),
  compose(
    applyMiddleware(
      sagaMiddleware,
      createLogger({
        duration: true,
        collapsed: () => true,
        stateTransformer: state => state.delete('api').toJS(),
        //stateTransformer: state => {
        //  const courses = state.getIn(['api', 'courses']);
        //  return state.setIn(['api', 'courses'], {
        //    alias: 'redacted',
        //    size: courses.size,
        //  }).toJS();
        //},
        //actionTransformer: action => (
        //  action.type === actions.ALL_COURSES ? (
        //    {
        //      ...action,
        //      courses: {
        //        alias: 'redacted',
        //        size: action.courses.length,
        //      },
        //    }
        //  ) : action
        //),
      }),
    ),
    //persistState(undefined, {
    //  key: 'selectedCourses',
    //  slicer: () => state => state.get('selection'),
    //  serialize: selection => {
    //    console.log('hey');
    //    return JSON.stringify(util.serializeSelection(selection));
    //  },
    //  deserialize: data => util.deserializeSelection(JSON.parse(data)),
    //  merge: (state, selection) => state.merge({
    //    selection,
    //    schedule: util.computeSchedule(selection),
    //  }),
    //}),
    //persistState(undefined, {
    //  key: 'courseDataTimestamp',
    //  slicer: () => state => state.getIn(['api', 'timestamp']),
    //  merge: (state, timestamp) => state.setIn(['api', 'timestamp'], timestamp),
    //}),
    //persistState(undefined, {
    //  key: 'scheduleTabSelected',
    //  slicer: () => state => state.get('mode'),
    //  serialize: mode => JSON.stringify(mode === Mode.SCHEDULE),
    //  deserialize: data => JSON.parse(data) ? Mode.SCHEDULE : Mode.COURSE_SEARCH,
    //  merge: (state, mode) => state.set('mode', mode),
    //}),
    //persistState(undefined, {
    //  key: 'courseList',
    //  slicer: () => state => state.get('api'),
    //  serialize: api => {},
    //  deserialize: data => {},
    //  merge: (state, api) => state.set('api'),
    //}),
    //persistState(undefined, {
    //  key: 'showClosedCourses',
    //}),
    //persistState(undefined, {
    //  key: 'hyperschedule-redux',
    //  serialize: state => {
    //    const selection = state.get('selection'),
    //          api       = state.get('api');
    //
    //    return JSON.stringify({
    //      selection: util.serializeSelection(selection),
    //      api: api.toJS(),
    //    });
    //  },
    //  deserialize: data => {
    //    
    //    if (data === null) {
    //      data = '{}';
    //    }
    //    
    //    const {selection = [], api = {}} = JSON.parse(data);
    //    return {
    //      selection: util.deserializeSelection(selection),
    //      api: fromJS(api),
    //    };
    //  },
    //  merge: (initial, {selection, api}) => {
    //    return (
    //      initial
    //        .set('selection', selection)
    //        .set('api', api)
    //        .set('schedule', util.computeSchedule(selection))
    //            );
    //          },
    //        }),
  ),
);

sagaMiddleware.run(sagas);


ReactDOM.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('root'));

