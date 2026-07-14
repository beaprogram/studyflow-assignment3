const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * runValidation
 * Collects the results of any express-validator chains that ran before it and,
 * if any failed, throws a single 422 error whose `details` array lists every
 * offending field. Centralising this keeps controllers free of validation
 * boilerplate and guarantees a consistent error shape.
 */
function runValidation(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return next(ApiError.unprocessable('One or more fields are invalid', 'VALIDATION_ERROR', details));
}

module.exports = runValidation;
