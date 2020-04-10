import React from "react";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage";

// [value: number, label: string ]
const options = [
  [0, "12:00am"],
  [1, "01:00am"],
  [2, "02:00am"],
  [3, "03:00am"],
  [4, "04:00am"],
  [5, "05:00am"],
  [6, "06:00am"],
  [7, "07:00am"],
  [8, "08:00am"],
  [9, "09:00am"],
  [10, "10:00am"],
  [11, "11:00am"],
  [12, "12:00pm"],
  [13, "01:00pm"],
  [14, "02:00pm"],
  [15, "03:00pm"],
  [16, "04:00pm"],
  [17, "05:00pm"],
  [18, "06:00pm"],
  [19, "07:00pm"],
  [20, "08:00pm"],
  [21, "09:00pm"],
  [22, "10:00pm"],
  [23, "11:00pm"]
];

const TimeSelector = ({ label, ...props }) => {
  let [field, meta] = useField(props.onChange ? "_" : props);
  if (props.onChange) field = {};
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <select className="form-control" {...props} {...field}>
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ErrorMessage error={meta.error} isHidden={!meta.touched} />
    </div>
  );
};

export default TimeSelector;
