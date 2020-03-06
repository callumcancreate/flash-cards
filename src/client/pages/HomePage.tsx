import React, { useEffect, useState } from "react";
import server from "../../apis/serverApi";
import Layout from "../components/Layout";
import useResource from "../hooks/useResource";

const Home = () => {
  const [data, error, isLoading] = useResource("/categories", {});
  const categories = data.categories || [];
  return (
    <Layout>
      <div className="container py-4">
        <ul>
          {categories.map(cat => (
            <li key={cat.categoryId}>{cat.name}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Home;
