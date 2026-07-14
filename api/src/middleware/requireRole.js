const ApiError = require('../utils/ApiError');

/**
 * requireRole
 * Returns a middleware that only allows the listed roles through. Must run
 * AFTER requireAuth (it relies on req.user.role). This is the enforcement
 * point for Role-Based Access Control: e.g. requireRole('instructor') guards
 * the instructor dashboard, requireRole('admin') guards the admin panel.
 */
function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowed.includes(req.user.role)) {
      return next(ApiError.forbidden('Your role does not have access to this resource'));
    }
    return next();
  };
}

module.exports = requireRole;
