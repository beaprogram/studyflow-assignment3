const asyncHandler = require('../utils/asyncHandler');
const Preferences = require('../models/Preferences');

/**
 * GET /api/v1/preferences
 * Returns the caller's preferences, creating sensible defaults on first read.
 */
const getPreferences = asyncHandler(async (req, res) => {
  let doc = await Preferences.findOne({ owner: req.user.id });
  if (!doc) doc = await Preferences.create({ owner: req.user.id });
  res.json({ preferences: doc.toJSON() });
});

/**
 * PUT /api/v1/preferences
 * Partial upsert of the caller's preferences.
 */
const upsertPreferences = asyncHandler(async (req, res) => {
  const allowed = [
    'maxStudyHoursPerDay',
    'preferredFocusWindows',
    'minBreakMinutes',
    'emailRemindersEnabled',
    'reminderLeadHours',
    'schedulingStyle',
  ];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const doc = await Preferences.findOneAndUpdate(
    { owner: req.user.id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ preferences: doc.toJSON() });
});

module.exports = { getPreferences, upsertPreferences };
