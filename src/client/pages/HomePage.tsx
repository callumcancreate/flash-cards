import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import useResource from "../hooks/useResource";
import ErrorMessage from "../components/ErrorMessage";
import CategoryList from "../components/CategoryList";

const Home = () => {
  const [data, error, isLoading] = useResource("/categories", {});
  const categories = data.categories || [];
  return (
    <Layout>
      <div className="container py-4">
        <ErrorMessage error={error} />
        <CategoryList categories={categories} />
      </div>
    </Layout>
  );
};

export default Home;
