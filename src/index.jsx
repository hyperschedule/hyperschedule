import React from 'react';
import ReactDOM from 'react-dom';
import createSagaMiddleware from 'redux-saga';
import sagas from './sagas';
import {Map} from 'immutable';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';

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

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
