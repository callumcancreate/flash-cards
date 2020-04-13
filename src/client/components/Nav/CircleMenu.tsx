import React from 'react';
import './CircleMenu.scss';

interface Props {
  isOpen: boolean;
  onClick: (event?: React.MouseEvent) => void;
  onKeyDown: (event?: React.KeyboardEvent) => void;
}

const CircleMenu: React.FC<Props> = ({ isOpen, onClick, onKeyDown }) => {
  return (
    <button
      type="button"
      className={`circle-menu${isOpen ? ' open' : ''}`}
      onClick={onClick}
      style={{ top: '3%', right: '3%' }}
      onKeyDown={onKeyDown}
    >
      <div className="bar1" />
      <div className="bar2" />
      <div className="bar3" />
    </button>
  );
};

export default CircleMenu;
