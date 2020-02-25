import React from "react";
import { history } from "../../index";
import "./Brand.scss";

const Brand = () => (
  <div className="brand" onClick={() => history.push("/")}>
    {/* <img src={logo} alt="Brand" /> */}
  </div>
);

export default Brand;
