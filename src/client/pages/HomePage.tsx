import React from "react";
import Layout from "../components/Layout";

const Home = () => {
  const [count, setCount] = React.useState(0);
  const inc = () => setCount(count + 1);
  const dec = () => setCount(count - 1);

  return (
    <Layout>
      <h1>Home</h1>
      <p>Hello World</p>
      <h3>{count}</h3>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
    </Layout>
  );
};

export default Home;
