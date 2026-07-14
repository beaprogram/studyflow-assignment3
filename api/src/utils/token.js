const jwt = require('jsonwebtoken');

/**
 * Sign a short-lived access token. The payload deliberately carries only the
 * user id and role - never the password hash or e-mail - so a leaked token
 * exposes the minimum possible information.
 */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

module.exports = { signAccessToken };
