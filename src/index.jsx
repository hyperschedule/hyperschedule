import React from 'react';
import ReactDOM from 'react-dom';
import createSagaMiddleware from 'redux-saga';
import sagas from './sagas';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';

import App from './App/App';
import hyperschedule from './reducers';
import * as serializeUtil from '@/util/serialize';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  hyperschedule,
  serializeUtil.deserializeStorage(localStorage),
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
