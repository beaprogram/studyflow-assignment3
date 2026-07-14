const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Availability = require('../models/Availability');

/**
 * GET /api/v1/availability
 * Returns the caller's availability grid (empty default if never set).
 */
const getAvailability = asyncHandler(async (req, res) => {
  let doc = await Availability.findOne({ owner: req.user.id });
  if (!doc) doc = await Availability.create({ owner: req.user.id, slots: [] });
  res.json({ availability: doc.toJSON() });
});

/**
 * PUT /api/v1/availability
 * Replaces the caller's availability grid in one call (the grid is edited as a
 * whole in the UI, so a full replace matches the real interaction).
 */
const upsertAvailability = asyncHandler(async (req, res) => {
  const { slots, timezone } = req.body;

  // Defensive check the validator cannot express: end must be after start.
  for (const s of slots) {
    if (s.endHour <= s.startHour) {
      throw ApiError.unprocessable('endHour must be greater than startHour', 'VALIDATION_ERROR', [
        { field: 'slots', message: `slot for day ${s.dayOfWeek} has endHour <= startHour` },
      ]);
    }
  }

  const update = { slots };
  if (timezone) update.timezone = timezone;

  const doc = await Availability.findOneAndUpdate(
    { owner: req.user.id },
    { $set: update },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ availability: doc.toJSON() });
});

module.exports = { getAvailability, upsertAvailability };
