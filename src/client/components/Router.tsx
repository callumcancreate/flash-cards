import React from "react";
import { Route, Switch } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

const Router = () => (
  <Switch>
    <Route path="/" exact component={HomePage} />
    <Route path="/login" component={LoginPage} />
  </Switch>
);

export default Router;
