import { asyncCatchWrapper, validateSchema } from '../../utils';
import User from '../models/User';
import { CreateUserSchema } from '../schemas/User';
import NamedError from '../models/NamedError';

export const register = asyncCatchWrapper(async (req, res) => {
  const { value, errors } = validateSchema(req.body, CreateUserSchema, {
    allowUnknown: false,
    stripUnknown: false
  });
  if (errors)
    throw new NamedError('Client', 'Unable to validate request', errors);
  const user = new User(value);
  await user.save();
  res.status(201).send({ user });
});

export const login = asyncCatchWrapper((req, res) => {
  res.send(req.body);
});
