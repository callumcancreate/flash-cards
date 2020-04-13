import jwt from 'jsonwebtoken';
import { asyncCatchWrapper } from '../../utils';
import NamedError from '../models/NamedError';

const auth = asyncCatchWrapper(async (req, res, next) => {
  // const csrf = req.headers.csrf;
  const { jwt: token } = req.cookies;
  const { sub, email, type, csrf } = await jwt.verify(
    token,
    process.env.JWT_SECRET
  );
  if (csrf !== req.headers.authorization || type !== 'BEARER')
    throw new NamedError('JsonWebTokenError', '');
  req.user = { userId: sub, email };
  next();
});

export default auth;