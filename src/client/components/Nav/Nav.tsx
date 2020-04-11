import React, { useState, useContext } from 'react';
import CircleMenu from './CircleMenu';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import history from '../../constants/history';
import { AuthContext } from '../Auth';

import './Nav.scss';

export interface Link {
  onClick: (e?: React.MouseEvent) => void;
  label: string;
}
interface Props {
  links?: Link[];
}

const Nav: React.FC<Props> = ({ links }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navStatus = isNavOpen ? ' open' : '';

  // Set default links
  const defaultLinks = [
    { onClick: () => history.push('/categories'), label: 'Categories' },
    user
      ? { onClick: logout, label: 'Log out' }
      : { onClick: () => history.push('/login'), label: 'Log in' }
  ];

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
          onKeyDown={(e) => console.log(e)} // TODO: fix this
          role="button"
          tabIndex={0}
        >
          <div className={`nav-slider${navStatus}`}>
            <ul>
              {(links || defaultLinks).map(({ onClick, label }) => (
                <li key={label}>
                  <button type="button" onClick={onClick}>
                    {label}
                  </button>
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
