import React from 'react';
import { useField, FieldConfig } from 'formik';
import ErrorMessage from '../ErrorMessage';

interface Props extends React.InputHTMLAttributes<any> {
  label?: string;
  skinny?: boolean;
  onChange?: (...args: any[]) => void;
}

const FormGroupWrap: React.FC<{ isWrapped: boolean }> = ({
  isWrapped,
  children,
}) =>
  isWrapped ? <div className="form-group">{children}</div> : <>{children}</>;

const Input: React.FC<Props> = ({ label, onChange, skinny, ...props }) => {
  const [field, meta, helpers] = useField(props as FieldConfig);
  if (onChange) field.onChange = (e) => onChange(e, helpers);
  const hash = String(Date.now() + Math.random());
  return (
    <FormGroupWrap isWrapped={!skinny}>
      {label && <label htmlFor={hash}>{label}</label>}
      <input id={hash} className="form-control" {...props} {...field} />
      <ErrorMessage error={meta.error} isHidden={!meta.touched} />
    </FormGroupWrap>
  );
};

export default Input;
