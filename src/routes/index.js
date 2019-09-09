import { ConnectedRouter } from "connected-react-router";
import App from "pages/App";
import Login from "pages/Login";
import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import history from "./history";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

class Routes extends Component {
  componentWillMount() {
    console.log('starting loading cocossd')
    cocoSsd.load('lite_mobilenet_v2')
    .then((result)=>{
      console.log('loaded cocossd...')
      window.cocossdLoaded = result
    })
  }
  render() {
    return (
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/login" />} />
          <Route path="/app" component={App} />
          <Route path="/login" component={Login} />
          <Route path="*" component={Login} />
        </Switch>
      </ConnectedRouter>
    );
  }
}
export default Routes
