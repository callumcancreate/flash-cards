import React from 'react';
import Nav from './Nav';
import Footer from './Footer';

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
  noHeader,
}) => {
  return (
    <>
      <header>{noHeader || header || <Nav />}</header>
      <main>
        <div>{children}</div>
      </main>
      <footer>{noFooter || footer || <Footer />}</footer>
    </>
  );
};

export default Layout;
