import { validateSchema } from '../../utils';
import NamedError from '../models/NamedError';

export default (schema) => (req, res, next) => {
  const { value, errors } = validateSchema(req.body, schema);
  if (errors)
    throw new NamedError('Client', 'Unable to validate request body', errors);
  req.body = value;
  next();
};
