import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import App from "./components/App";

export const history =
  typeof document !== "undefined" ? createBrowserHistory() : undefined;

ReactDOM.hydrate(
  <Router history={history}>
    <App />
  </Router>,
  document.querySelector("#root")
);
