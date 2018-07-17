import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import hyperschedule from './reducers';

import VisibleMainPanelModeSelector from './containers/VisibleMainPanelModeSelector';
import VisibleMainPanelContents from './containers/VisibleMainPanelContent';
import VisibleCourseList from './containers/VisibleCourseList';

import periodicApiUpdate from './sagas';

import 'normalize-css/normalize.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-virtualized/styles.css';
import './App.css';

const sagaMiddleware = createSagaMiddleware();
const logger = createLogger({
  duration: true,
  collapsed: (getState, action, logEntry) => !logEntry.error,
  stateTransformer: (state) => state.toJS()
});


let store = createStore(
  hyperschedule,
  applyMiddleware(sagaMiddleware, logger)
);

sagaMiddleware.run(periodicApiUpdate);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div>
          <VisibleMainPanelModeSelector />
          <VisibleMainPanelContents />
          <VisibleCourseList />
        </div>
      </Provider>
    );
  }
}

export default App;
