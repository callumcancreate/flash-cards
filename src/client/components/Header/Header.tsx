import React from "react";
import Nav from "../Nav/Nav";
import { Link } from "../Nav/Nav";
import "./Header.scss";

interface Props {
  navLinks: Link[];
}
const Header: React.FC<Props> = props => (
  <div className="header">
    <div className="container">
      <Nav links={props.navLinks} />
    </div>
  </div>
);

export default Header;
