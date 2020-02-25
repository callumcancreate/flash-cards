import React from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "../pages/HomePage";

const App: React.FC = () => (
  <Switch>
    <Route to="/" component={HomePage} />
  </Switch>
);

export default App;
