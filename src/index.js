import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "res/css/ReactToastify.css";
import Routes from "routes";
import { store } from "store";
import GlobalStyle from "styles/global";
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <Provider store={store}>
    <>
      <Routes />
      <GlobalStyle />
      <ToastContainer autoClose={4000} />
    </>
  </Provider>,
  document.getElementById("root")
);
