export default class NamedError extends Error {
  constructor(name, error, errors, ...args) {
    super(...args);
    this.name = name;
    this.date = new Date();
    if (error) this.error = error;
    if (errors) this.errors = errors;

    if (!Object.values(NamedError.NAMES).find(_name => _name === name))
      throw new SyntaxError(
        `Unrecognized name provided to NamedError. Received ${String(name)}`
      );

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NamedError);
    }
  }

  static NAMES = {
    AuthenticationError: "AuthenticationError",
    test: "Test"
  };
}
