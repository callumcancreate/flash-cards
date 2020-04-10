import React from "react";
import { useField } from "formik";

const Checkbox = ({ label, ...props }) => {
  // [field, meta, helpers]
  const [field] = useField(props.name);
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={field.value ? true : false}
        {...props}
        {...field}
      />
      {label && <label className="form-check-label">{label}</label>}
    </div>
  );
};

export default Checkbox;
