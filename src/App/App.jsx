import React, { Component } from 'react';
import {createStore, applyMiddleware, compose} from 'redux';
import { Provider } from 'react-redux';

import {fromJS, Map} from 'immutable';

import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import persistState from 'redux-localstorage';

import periodicApiUpdate from './sagas';
import hyperschedule from './reducers';

import ModeSelector from './ModeSelector/ModeSelector';
import ModeContent from './ModeContent/ModeContent';
import FocusSummary from './FocusSummary/FocusSummary';
import SelectedCourses from './SelectedCourses/SelectedCourses';



import './App.css';

const sagaMiddleware = createSagaMiddleware();
const logger = createLogger({
    duration: true,
    collapsed: (getState, action, logEntry) => !logEntry.error,
    stateTransformer: (state) => state.delete('courses').toJS()
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
            merge: (initial, saved) => initial.merge(saved),
        }),
    ),
);

sagaMiddleware.run(periodicApiUpdate);

const App = () => {
    return (
        <Provider store={store}>
          <div className="columns">
            <div className="mode column">
              <div className="selector container">
                <ModeSelector/>
              </div>
              <div className="content container">
                <ModeContent/>
              </div>
            </div>
            <div className="sidebar column">
              <FocusSummary/>
              <SelectedCourses/>
            </div>
          </div>
        </Provider>
    );
};

export default App;
