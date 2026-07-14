const mongoose = require('mongoose');

const FOCUS_WINDOWS = ['morning', 'afternoon', 'evening', 'late_night'];
const STYLES = ['conservative', 'balanced', 'aggressive'];

const preferencesSchema = new mongoose.Schema(
  {
    // One preferences document per user (1:1).
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    maxStudyHoursPerDay: { type: Number, min: 1, max: 16, default: 4 },
    preferredFocusWindows: {
      type: [{ type: String, enum: FOCUS_WINDOWS }],
      default: ['evening'],
    },
    minBreakMinutes: { type: Number, min: 0, max: 120, default: 15 },
    emailRemindersEnabled: { type: Boolean, default: true },
    reminderLeadHours: { type: Number, min: 0, max: 168, default: 24 },
    schedulingStyle: { type: String, enum: STYLES, default: 'balanced' },
  },
  { timestamps: true }
);

preferencesSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Preferences', preferencesSchema);
module.exports.FOCUS_WINDOWS = FOCUS_WINDOWS;
module.exports.STYLES = STYLES;
