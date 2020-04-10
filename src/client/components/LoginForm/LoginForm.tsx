import React, { useContext } from "react";
import { Formik, Form } from "formik";
import validate from "./validate";
import Loader from "../Loader";
import Input from "../form-inputs/Input";
import { AuthContext } from "../Auth";
import "./LoginForm.scss";
import { Redirect } from "react-router-dom";

const LoginForm = ({ initialValues = { email: "", password: "" } }) => {
  const { user } = useContext(AuthContext);
  if (user) return <Redirect to="/" />;

  const onSubmit = async ({ email, password }, actions) => {
    try {
      console.log(email, password);
    } catch (e) {
      actions.setErrors({
        password: "Unable to login. Please check your email or password.",
      });
      actions.setSubmitting(false);
    }
  };
  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="login-form">
          <Input name="email" placeholder="email" />
          <Input name="password" type="password" placeholder="password" />
          <button
            className="btn btn-primary btn-block relative d-flex justify-content-center"
            type="submit"
            disabled={isSubmitting}
          >
            <Loader
              loading={isSubmitting}
              noBackground
              noStretch
              light
              diameter="1.4rem"
            />
            <span className="mx-2">Login</span>
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
