import React from "react";
import { Route, Switch } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import { AuthProvider } from "./Auth";
import "./App.scss";
// import "./App-dev.scss";

const App: React.FC = () => (
  <AuthProvider>
    <Switch>
      <Route to="/" component={HomePage} />
      <Route to="/login" component={LoginPage} />
    </Switch>
  </AuthProvider>
);

export default App;
