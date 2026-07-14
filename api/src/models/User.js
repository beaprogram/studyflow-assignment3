const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['student', 'instructor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Never selected by default, so the hash is not returned in normal queries.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'student', index: true },
    status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Instance helper to verify a candidate password against the stored hash.
userSchema.methods.verifyPassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Static helper used by the auth controller to create a user from a plain
// password (hashing happens here so controllers never touch bcrypt directly).
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
