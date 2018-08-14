import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';

import sagas from './sagas';
import createSagaMiddleware from 'redux-saga';

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
  ),
);

sagaMiddleware.run(sagas);


ReactDOM.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('root'));

