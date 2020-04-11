import React from "react";
import Router from "./Router";
import { AuthProvider } from "./Auth";
import "./App.scss";
// import "./App-dev.scss";

const App: React.FC = () => (
  <AuthProvider>
    <Router />
  </AuthProvider>
);

export default App;
