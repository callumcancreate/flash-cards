import { asyncCatchWrapper } from '../../utils';
import User from '../models/User';
// import NamedError from '../models/NamedError';

export const register = asyncCatchWrapper(async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).send({ user });
});

export const login = asyncCatchWrapper((req, res) => {
  res.send(req.body);
});
