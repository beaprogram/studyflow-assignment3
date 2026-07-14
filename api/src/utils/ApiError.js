/**
 * ApiError
 * A small helper that lets controllers throw errors carrying an HTTP status
 * code and a machine-readable code. The central errorHandler middleware turns
 * these into a consistent JSON envelope.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = undefined, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, code = 'BAD_REQUEST', details) {
    return new ApiError(400, msg, code, details);
  }
  static unauthorized(msg = 'Authentication required', code = 'UNAUTHENTICATED') {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = 'You do not have permission to perform this action', code = 'FORBIDDEN') {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, msg, code);
  }
  static conflict(msg, code = 'CONFLICT') {
    return new ApiError(409, msg, code);
  }
  static unprocessable(msg, code = 'VALIDATION_ERROR', details) {
    return new ApiError(422, msg, code, details);
  }
}

module.exports = ApiError;
