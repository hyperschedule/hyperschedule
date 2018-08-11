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

import * as util from '@/util/hyperschedule-util';

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
        stateTransformer: state => {
          const courses = state.getIn(['api', 'courses']);
          return state.setIn(['api', 'courses'], {
            alias: 'redacted',
            size: courses.size,
          }).toJS();
        },
        actionTransformer: action => (
          action.type === actions.ALL_COURSES ? (
            {
              ...action,
              courses: {
                alias: 'redacted',
                size: action.courses.length,
              },
            }
          ) : action
        ),
      }),
    ),
    persistState(undefined, {
      key: 'hyperschedule-redux',
      serialize: state => {
        const selection = state.get('selection'),
              api       = state.get('api');

        return JSON.stringify({
          selection: util.serializeSelection(selection),
          api: api.toJS(),
        });
      },
      deserialize: data => {
        
        if (data === null) {
          data = '{}';
        }
        
        const {selection = [], api = {}} = JSON.parse(data);
        return {
          selection: util.deserializeSelection(selection),
          api: fromJS(api),
        };
      },
      merge: (initial, {selection, api}) => {
        return (
          initial
            .set('selection', selection)
            .set('api', api)
            .set('schedule', util.computeSchedule(selection))
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

