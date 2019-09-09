import { applyMiddleware, createStore } from "redux";
import { connectRouter, routerMiddleware } from "connected-react-router";
import createSagaMiddleware from "redux-saga";
import reducers from "./ducks";
import sagas from "./sagas";

import history from "routes/history";

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware, routerMiddleware(history)];

const store = createStore(
  connectRouter(history)(reducers),
  applyMiddleware(...middlewares)
);
sagaMiddleware.run(sagas);

export { store };
