import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useResource from '../hooks/useResource';
import ErrorMessage from '../components/ErrorMessage';
import CategoryList from '../components/CategoryList';
import './HomePage.scss';

const HomePage = () => {
  const [data, error, isLoading] = useResource('/categories', {});
  const categories = data.categories || [];
  return (
    <Layout>
      <div className="container py-5 home-page">
        <ErrorMessage error={error} />
        <CategoryList categories={categories} />
      </div>
    </Layout>
  );
};

export default HomePage;
