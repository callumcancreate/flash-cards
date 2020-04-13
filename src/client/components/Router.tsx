import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import AuthRoute from './AuthRoute';
import CategoriesPage from '../pages/CategoriesPage';
import LoginPage from '../pages/LoginPage';

const Router = () => (
  <Switch>
    <Route path="/" exact>
      <Redirect to="/categories" />
    </Route>
    <AuthRoute path="/categories" component={CategoriesPage} />
    <Route path="/login" component={LoginPage} />
  </Switch>
);

export default Router;
