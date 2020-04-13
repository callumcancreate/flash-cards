import jwt from 'jsonwebtoken';

import { asyncCatchWrapper, validateSchema } from '../../utils';
import User from '../models/User';
import { CreateUserSchema, LoginSchema } from '../schemas/User';
import NamedError from '../models/NamedError';
import pool from '../db';

const bearerCookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test',
  sameSite: true,
  path: '/api'
};

const refreshCookieOptions = {
  ...bearerCookieOptions,
  path: '/api/v1/users/auth/refresh'
};

const getTokens = async (userId, email) => {
  const [bearer, csrfBearer] = await User.getToken(userId, email, 5, 'BEARER');
  const [refresh, csrfRefresh] = await User.getToken(
    userId,
    email,
    60 * 60 * 24 * 7,
    'REFRESH'
  );

  return {
    tokens: { bearer, refresh },
    csrf: { bearer: csrfBearer, refresh: csrfRefresh }
  };
};

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

export const login = asyncCatchWrapper(async (req, res) => {
  const { value, errors } = validateSchema(req.body, LoginSchema, {
    allowUnknown: false,
    stripUnknown: false
  });
  if (errors)
    throw new NamedError('Client', 'Unable to validate request', errors);

  const user = await User.findByCredentials(value);
  if (!user) throw new NamedError('Auth', 'Invalid email or password');
  const { tokens, csrf } = await getTokens(user.userId, user.email);
  await pool.query(
    'insert into refresh_tokens (token, user_id) values ($1, $2)',
    [tokens.refresh, user.userId]
  );
  res
    .cookie('jwt', tokens.bearer, bearerCookieOptions)
    .cookie('refreshToken', tokens.refresh, refreshCookieOptions)
    .send({ user, csrf });
});

export const getMyProfile = asyncCatchWrapper(async (req, res) => {
  res.send({ user: req.user });
});

export const authRefresh = asyncCatchWrapper(async (req, res) => {
  const { refreshToken: token } = req.cookies;
  const { sub, email, type, csrf: tokenCSRF } = await jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  console.log('tokenCSRF', tokenCSRF);
  console.log('auth header', req.headers.authorization);
  if (tokenCSRF !== req.headers.authorization || type !== 'REFRESH')
    throw new NamedError('JsonWebTokenError', '');

  const {
    rowCount
  } = await pool.query(
    'delete from refresh_tokens r where r.token = $1 and r.user_id = $2',
    [token, sub]
  );

  if (!rowCount) throw new NamedError('Auth', 'Invalid token');

  // Generate new tokens
  const { tokens, csrf } = await getTokens(sub, email);

  await pool.query(
    'insert into refresh_tokens (token, user_id) values ($1, $2)',
    [tokens.refresh, sub]
  );
  res
    .cookie('jwt', tokens.bearer, bearerCookieOptions)
    .cookie('refreshToken', tokens.refresh, refreshCookieOptions)
    .send({ csrf });
});
