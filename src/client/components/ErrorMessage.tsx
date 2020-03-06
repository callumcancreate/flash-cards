import React from "react";

interface Props {
  error: string;
  isHidden?: boolean;
}

const ErrorMessage: React.FC<Props> = ({ error, isHidden = false }) =>
  error && !isHidden ? <p className="text-danger">{error}</p> : null;

export default ErrorMessage;
