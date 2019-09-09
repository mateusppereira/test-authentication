import React, { Component } from "react";
import { Router, Redirect, Route, Switch } from "react-router-dom";
import Main from "./components/Main";
import Dashboard from "./components/Dashboard";
import Test from "./components/Test";
import history from "routes/history";

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <>
          <Switch>
            <Route path="/app/main" component={Main} />
            <Route path="/app/test/:testId/:userTestId" component={Test} />
            <Route path="/app/dashboard/:userTestId" component={Dashboard} />
            <Route exact path="/app/*" render={() => <Redirect to="/app/main" />} />
          </Switch>
        </>
      </Router>
    );
  }
}

export default App;
