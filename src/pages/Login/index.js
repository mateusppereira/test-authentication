import React, { Component } from "react";
import { Router, Redirect, Route, Switch } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import history from "routes/history";

class Login extends Component {
  render() {
    return (
      <Router history={history}>
        <>
          <Switch>
            <Route path="/login/sign-in" component={SignIn} />
            <Route path="/login/sign-up" component={SignUp} />
            <Route exact path="/login/" render={() => <Redirect to="/login/sign-in" />}/>
          </Switch>
        </>
      </Router>
    );
  }
}

export default Login;
