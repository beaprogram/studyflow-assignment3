const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { signAccessToken } = require('../utils/token');

/**
 * POST /api/v1/auth/register
 * Creates a new account. Passwords are hashed with bcrypt before storage.
 * Self-registering as an administrator is forbidden - admins can only be
 * promoted by an existing admin through the admin panel.
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  let { role } = req.body;

  if (role === 'admin') {
    throw ApiError.forbidden('Administrator accounts cannot be self-registered', 'ROLE_NOT_ALLOWED');
  }
  if (!role) role = 'student';

  const existing = await User.findOne({ email });
  if (existing) {
    // Generic message - does not confirm whether the email is registered in a
    // way an attacker could exploit beyond what a unique-email signup implies.
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ fullName, email, passwordHash, role });

  const token = signAccessToken(user);
  res.status(201).json({ token, user: user.toJSON() });
});

/**
 * POST /api/v1/auth/login
 * Verifies credentials and returns a JWT. The same generic error is returned
 * whether the email is unknown or the password is wrong, so the endpoint does
 * not reveal which accounts exist.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Incorrect email or password', 'INVALID_CREDENTIALS');
  }

  const ok = await user.verifyPassword(password);
  if (!ok) {
    throw ApiError.unauthorized('Incorrect email or password', 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  res.status(200).json({ token, user: user.toJSON() });
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 */
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user: user.toJSON() });
});

module.exports = { register, login, me };
