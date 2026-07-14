const ApiError = require('../utils/ApiError');

// Catches any request that did not match a route and forwards a 404.
module.exports = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
