const ApiError = require('../utils/ApiError');

/**
 * errorHandler
 * The single place where every error becomes an HTTP response. It maps known
 * failure shapes (our ApiError, Mongoose validation/cast errors, duplicate-key
 * errors, JWT errors) to clean status codes and a uniform body:
 *
 *   { "error": { "code": "...", "message": "...", "details": [...] } }
 *
 * Unexpected errors collapse to a generic 500 so internal details (stack
 * traces, driver messages) are never leaked to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof ApiError) {
    status = err.statusCode;
    code = err.code || code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'One or more fields are invalid';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // Bad ObjectId in a route param
    status = 400;
    code = 'INVALID_ID';
    message = `Invalid value for '${err.path}'`;
  } else if (err.code === 11000) {
    // Mongo duplicate key
    status = 409;
    code = 'DUPLICATE';
    message = 'A record with these values already exists';
    details = Object.keys(err.keyValue || {}).map((field) => ({ field, message: 'must be unique' }));
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or expired token';
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

module.exports = errorHandler;
