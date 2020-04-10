import React from "react";
import Input from "./Input";

const NumberInput = props => {
  const format = val =>
    String(val)
      .replace(/[^\d-.]/g, "")
      .replace(/(^.+)-/g, "$1") // remove '-' if not first
      .replace(/^(-?)\./g, "$1") // remove leading period
      .split("")
      .reverse()
      .join("")
      .replace(/-(?=.*-)/g, "") //  remove duplicates of '-'
      .replace(/\.(?=.*\.)/g, "") // remove duplicates of '.'
      .split("")
      .reverse()
      .join("");
  const onChange = ({ target }, { setValue }) => setValue(format(target.value));
  return <Input onChange={onChange} {...props} />;
};

export default NumberInput;
