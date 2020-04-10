import { isEmail } from "validator";

const validate = ({ email, password }) => {
  const errors = {};
  if (!isEmail(email)) errors.email = "Please enter a valid email";
  if (!password) errors.password = "Please enter a password";
  return errors;
};

export default validate;
