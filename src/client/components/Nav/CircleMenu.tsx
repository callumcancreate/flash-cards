import React, { useState } from "react";
import "./CircleMenu.scss";

interface Props {
  isOpen: boolean;
  onClick: (event?: React.MouseEvent) => void;
}

const CircleMenu: React.FC<Props> = ({ isOpen, onClick }) => {
  return (
    <div
      className={`circle-menu${isOpen ? " open" : ""}`}
      onClick={onClick}
      style={{ top: "3%", right: "3%" }}
    >
      <div className="bar1" />
      <div className="bar2" />
      <div className="bar3" />
    </div>
  );
};

export default CircleMenu;
