import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";
import history from "routes/history";

export default combineReducers({
  router: connectRouter(history)
});
