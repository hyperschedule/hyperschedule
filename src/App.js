import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import Immutable from 'immutable';
import hyperschedule from './reducers';

import VisibleCourseSearchInput from './containers/VisibleCourseSearchInput';
import VisibleCourseSearchList from './containers/VisibleCourseSearchList';
import VisibleMainPanelModeSelector from './containers/VisibleMainPanelModeSelector';
import VisibleMainPanelContents from './containers/VisibleMainPanelContent';
import VisibleCourseList from './containers/VisibleCourseList';

import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import periodicApiUpdate from './sagas';

import 'react-virtualized/styles.css';
import { createLogger } from 'redux-logger';

import { Button, Icon } from 'semantic-ui-react';


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


// playground starts here

const SortableItem = SortableElement(({value}) =>
                                     <li>{value}</li>
                                    );


// playground ends here
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
