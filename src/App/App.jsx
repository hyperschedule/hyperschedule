import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

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
    applyMiddleware(sagaMiddleware, logger),
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
