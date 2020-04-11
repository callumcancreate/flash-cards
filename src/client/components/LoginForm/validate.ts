import { isEmail } from 'validator';

export interface Values {
  email: string;
  password: string;
}

const validate = ({ email, password }: Values) => {
  const errors: { email?: string; password?: string } = {};
  if (!isEmail(email)) errors.email = 'Please enter a valid email';
  if (!password) errors.password = 'Please enter a password';
  return errors;
};

export default validate;
