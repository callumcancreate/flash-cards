import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import App from "./components/App";
import history from "./constants/history";

ReactDOM.hydrate(
  <Router history={history}>
    <App />
  </Router>,
  document.querySelector("#root")
);
