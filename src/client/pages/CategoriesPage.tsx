import React from 'react';
import Layout from '../components/Layout';
import useResource from '../hooks/useResource';
import ErrorMessage from '../components/ErrorMessage';
import CategoryList from '../components/CategoryList';
import Loader from '../components/Loader';
import './HomePage.scss';

const HomePage = () => {
  const [data, error, isLoading] = useResource(
    '/categories',
    {},
    { secure: true }
  );
  const categories = data.categories || [];
  return (
    <Layout>
      <div className="container py-5 home-page relative">
        <Loader loading={isLoading} />
        <ErrorMessage error={error} />
        <CategoryList categories={categories} />
      </div>
    </Layout>
  );
};

export default HomePage;
