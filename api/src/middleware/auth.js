const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * requireAuth
 * Verifies the Bearer JWT, confirms the user still exists and is active, and
 * attaches a minimal `req.user` ({ id, role }) for downstream handlers.
 *
 * Rejects with 401 when the token is missing, malformed, expired, or points to
 * a user that has since been deactivated. The error message is intentionally
 * generic ("Invalid or expired token") so it does not leak whether a given
 * account exists.
 */
const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing Bearer token');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_err) {
    throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.sub).select('_id role status');
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
  }

  req.user = { id: user._id, role: user.role };
  next();
});

module.exports = requireAuth;
