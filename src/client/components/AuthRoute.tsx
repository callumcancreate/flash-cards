import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./Auth";
import Loader from "./Loader";

const AuthRoute = ({ component, ...props }) => {
  const { user, isLoading } = useContext(AuthContext);
  const Component = component;
  return (
    <Route
      render={() => {
        if (isLoading) return <Loader loading />;
        return user ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

export default AuthRoute;
