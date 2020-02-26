import React from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "../pages/HomePage";
import "./App.scss";
// import "./App-dev.scss";

const App: React.FC = () => (
  <Switch>
    <Route to="/" component={HomePage} />
  </Switch>
);

export default App;
