import jwt from 'jsonwebtoken';
import { asyncCatchWrapper } from '../../utils';
import NamedError from '../models/NamedError';

const auth = asyncCatchWrapper(async (req, res, next) => {
  const { jwt: token } = req.cookies;
  const { sub, email, type, csrf } = await jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const headerCsrf =
    req.headers.authorization &&
    req.headers.authorization.replace('Bearer ', '');
  if (csrf !== headerCsrf || type !== 'BEARER')
    throw new NamedError('JsonWebTokenError', '');
  req.user = { userId: sub, email };
  next();
});

export default auth;
