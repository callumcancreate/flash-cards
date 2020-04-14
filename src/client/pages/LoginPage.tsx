import React from 'react';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Layout noHeader>
      <div
        className="container-fluid d-flex justify-content-center align-items-center py-5"
        style={{ height: '100%' }}
      >
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
