import React, { useState, MouseEvent } from "react";
import Hamburger from "./Hamburger";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "./Nav.scss";

export interface Link {
  onClick: (e?: MouseEvent) => any;
  label: string;
}
interface Props {
  links: Link[];
}

const Nav: React.FC<Props> = ({ links = [] }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navStatus = isNavOpen ? " open" : "";

  useBodyScrollLock(isNavOpen);

  return (
    <div>
      <Hamburger onClick={() => setIsNavOpen(true)} />
      <nav>
        <div
          className={`nav-container${navStatus}`}
          onClick={() => setIsNavOpen(false)}
        >
          <div className={`nav-slider${navStatus}`}>
            <i className="ui delete icon" />
            <ul>
              {links.map(({ onClick, label }, i) => (
                <li key={i} onClick={onClick}>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
