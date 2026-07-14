const { body } = require('express-validator');
const { ROLES } = require('../models/User');

// Strong-ish password policy mirrored from the Sign Up prototype:
// >= 8 chars, at least one number, one symbol, one uppercase letter.
const passwordRules = body('password')
  .isString()
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[0-9]/).withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a symbol')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter');

const registerRules = [
  body('fullName').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  passwordRules,
  // Role is optional; defaults to student. Self-registering as admin is blocked
  // here AND in the controller (defence in depth).
  body('role').optional().isIn(ROLES).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
