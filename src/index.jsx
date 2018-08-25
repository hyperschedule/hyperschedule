import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import sagas from './sagas';
import createSagaMiddleware from 'redux-saga';
import {createLogger} from 'redux-logger';
import {Map} from 'immutable';

import App from './App/App';

import hyperschedule from './reducers';

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
