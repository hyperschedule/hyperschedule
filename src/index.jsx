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


const sagaMiddleware = createSagaMiddleware();
const logger = createLogger({
    duration: true,
    collapsed: (getState, action, logEntry) => !logEntry.error,
    stateTransformer: (state) => state.set('courses', {
        alias: 'redacted',
        length: state.get('courses').length,
    }).toJS(),
    actionTransformer: action => {
        if (action.hasOwnProperty('course')) {
            return {
                ...action,
                course: action.course.toJS(),
            };
        }

        return action;
    },
});


let store = createStore(
    hyperschedule,
    Map(),
    compose(
        applyMiddleware(sagaMiddleware, logger),
        persistState(undefined, {
            slicer: paths => state => state.delete('courses'),
            serialize: state => JSON.stringify(state.toJS()),
            deserialize: s => {
                try {
                    return fromJS(JSON.parse(s));
                } catch (exception) {
                    return Map();
                }
            },
            merge: (initial, saved) => initial,
        }),
    ),
);

sagaMiddleware.run(periodicApiUpdate);


ReactDOM.render((
    <Provider store={store}>
      <App/>
    </Provider>
), document.getElementById('root'));
