import React, { useContext } from "react";
import { Formik, Form } from "formik";
import validate from "./validate";
import Loader from "../Loader";
import Input from "../form-inputs/Input";
import { AuthContext } from "../Auth";
import "./LoginForm.scss";
import { Redirect } from "react-router-dom";
import { Values } from "./validate";
import api from "../../../apis/serverApi";

interface Props {
  initialValues?: Values;
}

const LoginForm: React.FC<Props> = ({
  initialValues = { email: "", password: "" },
}) => {
  const { user, login } = useContext(AuthContext);
  if (user) return <Redirect to="/" />;

  const onSubmit = async (values: Values, actions) => {
    try {
      const { data } = await api.open.post("/users/login", values);
      login(data);
    } catch (e) {
      console.error(e);
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
