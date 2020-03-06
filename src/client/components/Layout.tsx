import React from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import history from "../constants/history";

interface Props {
  header?: JSX.Element;
  footer?: JSX.Element;
  noFooter?: boolean;
  noHeader?: boolean;
}

const Layout: React.FC<Props> = ({
  header,
  footer,
  children,
  noFooter,
  noHeader
}) => {
  const defaultLinks = [
    { onClick: () => history.push("/"), label: "Home" },
    { onClick: () => history.push("/login"), label: "Login" }
  ];

  return (
    <>
      <header>{noHeader || header || <Nav links={defaultLinks} />}</header>
      <main>
        <div>{children}</div>
      </main>
      <footer>{noFooter || footer || <Footer />}</footer>
    </>
  );
};

export default Layout;
