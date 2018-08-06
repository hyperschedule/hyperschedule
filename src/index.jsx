import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';

import periodicApiUpdate from './sagas';
import createSagaMiddleware from 'redux-saga';

import persistState from 'redux-localstorage';
import {createLogger} from 'redux-logger';

import {fromJS, Map} from 'immutable';

import App from './App/App';

import hyperschedule from './reducers';

import * as util from 'hyperschedule-util';

import * as actions from './actions';

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
        stateTransformer: state => state.set('courses', {
          alias: 'redacted',
          size: state.get('courses').size,
        }).toJS(),
        actionTransformer: action => (
          action.type === actions.UPDATE_COURSES ? (
            {
              ...action,
              courses: {
                alias: 'redacted',
                size: action.courses.size,
              },
            }
          ) : action
        ),
      }),
    ),
    persistState(undefined, {
      key: 'hyperschedule-redux',
      serialize: state => {
        const selection = state.getIn(['app', 'selection']),
              courses = state.get('courses');

        return JSON.stringify({
          selection: util.serializeSelection(selection),
          courses: courses.toJS(),
        });
      },
      deserialize: data => {
        const {selection, courses} = JSON.parse(data);
        return {
          selection: util.deserializeSelection(selection),
          courses: fromJS(courses),
        };
      },
      merge: (initial, {selection, courses}) => {
        return (
          initial
            .setIn(['app', 'selection'], selection)
            .set('courses', courses)
            .setIn(['app', 'schedule'], util.computeSchedule(selection))
        );
      },
    }),
  ),
);

sagaMiddleware.run(periodicApiUpdate);


ReactDOM.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('root'));

