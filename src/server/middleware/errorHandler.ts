import { Name } from '../models/NamedError';

export default function errorHandler(e, req, res, next) {
  switch (e.name as Name) {
    // Custom errors
    case 'Auth':
      e.status = 403;
      if (!e.error) e.error = 'Unauthorized request';
      break;
    case 'NotFound':
      e.status = 404;
      if (!e.error) e.error = 'Unable to find resource';
      break;
    case 'Client':
      e.status = 400;
      break;

    // JWT errors
    case 'TokenExpiredError':
      e.status = 401;
      break;

    case 'JsonWebTokenError':
      e.status = 403;
      e.error = 'Invalid token';
      break;
    // System errors
    case 'EvalEror':
    case 'InternalError':
    case 'RangeError':
    case 'SyntaxError':
    case 'TypeError':
    case 'URIError':
    default:
      e.status = 500;
      e.error = 'Internal server error';
  }
  console.log(e);
  res.status(e.status).send({ error: e.error, errors: e.errors });
}
