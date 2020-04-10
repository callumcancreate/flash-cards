import React from "react";
import Layout from "../components/Layout";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <Layout>
      <div className="container py-5">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
