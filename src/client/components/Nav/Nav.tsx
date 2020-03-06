import React, { useState, MouseEvent } from "react";
import CircleMenu from "./CircleMenu";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "./Nav.scss";

export interface Link {
  onClick: (e?: React.MouseEvent) => any;
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
      <div>
        <CircleMenu
          isOpen={isNavOpen}
          onClick={() => setIsNavOpen(!isNavOpen)}
        />
      </div>
      <nav>
        <div
          className={`nav-container${navStatus}`}
          onClick={() => setIsNavOpen(false)}
        >
          <div className={`nav-slider${navStatus}`}>
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
