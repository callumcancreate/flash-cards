import React, { MouseEvent } from 'react';
import './Hamburger.scss';

interface Props {
  onClick: (e: MouseEvent) => any;
}

const Hamburger: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="hamburger" onClick={onClick}>
      <div />
      <div />
      <div />
    </div>
  );
};

export default Hamburger;
