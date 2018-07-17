import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import hyperschedule from './reducers';

import ModeSelector from './components/ModeSelector/wrapper';
//import MainPanelContents from './containers/MainPanelContent';
//import CourseList from './containers/CourseList';

import periodicApiUpdate from './sagas';

import './App.css';

const sagaMiddleware = createSagaMiddleware();
const logger = createLogger({
    duration: true,
    collapsed: (getState, action, logEntry) => !logEntry.error,
    stateTransformer: (state) => state.toJS()
});


let store = createStore(
    hyperschedule,
    applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(periodicApiUpdate);

const App = () => {
    return (
        <Provider store={store}>
          <div>
            <ModeSelector/>
          </div>
        </Provider>
    );
};

export default App;
