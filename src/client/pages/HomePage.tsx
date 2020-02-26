import React from "react";
import Layout from "../components/Layout";
import CollapsibleList from "../components/CollapsibleList";

const Home = () => {
  return (
    <Layout>
      <div className="container py-4">
        <CollapsibleList />
      </div>
    </Layout>
  );
};

export default Home;
