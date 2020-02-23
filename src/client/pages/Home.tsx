import React from "react";

const Home = () => {
  const [count, setCount] = React.useState(0);
  const inc = () => setCount(count + 1);
  const dec = () => setCount(count - 1);

  return (
    <div>
      <h1>Home</h1>
      <p>Hello World</p>
      <h3>{count}</h3>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
    </div>
  );
};

export default Home;
