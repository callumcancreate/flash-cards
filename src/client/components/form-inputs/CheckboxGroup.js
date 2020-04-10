import React from "react";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage";

const CheckboxGroup = ({ checkboxes, label, name }) => {
  const [field, meta, helpers] = useField(name);
  const values = field.value;
  const setValues = helpers.setValue;
  const checkedStatuses = checkboxes.reduce((hash, checkbox) => {
    hash[checkbox.value] = values.includes(checkbox.value);
    return hash;
  }, {});

  const onChange = value => {
    helpers.setTouched(true);
    checkedStatuses[value]
      ? setValues(values.filter(v => v !== value))
      : setValues([...values, value]);
  };
  return (
    <div className="form-group">
      <label>{label}</label>
      {checkboxes.map(({ label, value }, i) => (
        <div className="form-check" key={i}>
          <input
            className="form-check-input"
            type="checkbox"
            onChange={() => onChange(value)}
            checked={checkedStatuses[value] ? true : false}
          />
          {label && <label className="form-check-label">{label}</label>}
        </div>
      ))}
      <ErrorMessage error={meta.error} isHidden={!meta.touched} />
    </div>
  );
};

export default CheckboxGroup;
