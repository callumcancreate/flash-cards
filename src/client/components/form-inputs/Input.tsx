import React from 'react';
import { useField, FieldConfig } from 'formik';
import ErrorMessage from '../ErrorMessage';

interface Props extends React.InputHTMLAttributes<any> {
  label?: string;
  skinny?: boolean;
  onChange?: (...args: any[]) => void;
}

const FormGroupWrap = ({ isWrapped, children }) =>
  isWrapped ? <div className="form-group">{children}</div> : <>{children}</>;

const Input: React.FC<Props> = ({ label, onChange, skinny, ...props }) => {
  let [field, meta, helpers] = useField(props as FieldConfig);
  if (onChange) field.onChange = (e) => onChange(e, helpers);

  return (
    <FormGroupWrap isWrapped={!skinny}>
      {label && <label>{label}</label>}
      <input className="form-control" {...props} {...field} />
      <ErrorMessage error={meta.error} isHidden={!meta.touched} />
    </FormGroupWrap>
  );
};

export default Input;
