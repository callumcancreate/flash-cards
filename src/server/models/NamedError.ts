export type Name =
  | 'Auth'
  | 'NotFound'
  | 'Client'
  | 'Server'
  | 'EvalEror'
  | 'InternalError'
  | 'RangeError'
  | 'SyntaxError'
  | 'TypeError'
  | 'URIError'
  | 'TokenExpiredError'
  | 'JsonWebTokenError';

class NamedError extends Error {
  name: Name;

  error: string;

  errors?: object;

  date: Date;

  constructor(name: Name, error: string, errors?, ...args) {
    super(...args);
    this.name = name;
    this.date = new Date();
    if (error) this.error = error;
    if (errors) this.errors = errors;
  }
}

export default NamedError;
