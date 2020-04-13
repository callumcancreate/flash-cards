/* Wrap async middleware/routes to catch errors and pass to error handler middleware */
export default (func) => (...args) => func(...args).catch(args[2]);
