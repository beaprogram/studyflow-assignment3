const { body } = require('express-validator');
const { STATES } = require('../models/Availability');
const { FOCUS_WINDOWS, STYLES } = require('../models/Preferences');
const { OUTCOMES } = require('../models/CompletionLog');

// --- Availability ---------------------------------------------------------
const upsertAvailabilityRules = [
  body('timezone').optional().isString().trim().isLength({ max: 60 }),
  body('slots').isArray().withMessage('slots must be an array'),
  body('slots.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be 0-6'),
  body('slots.*.startHour').isInt({ min: 0, max: 23 }).withMessage('startHour must be 0-23'),
  body('slots.*.endHour').isInt({ min: 1, max: 24 }).withMessage('endHour must be 1-24'),
  body('slots.*.state').isIn(STATES).withMessage(`state must be one of: ${STATES.join(', ')}`),
];

// --- Preferences ----------------------------------------------------------
const upsertPreferencesRules = [
  body('maxStudyHoursPerDay').optional().isInt({ min: 1, max: 16 }),
  body('preferredFocusWindows').optional().isArray(),
  body('preferredFocusWindows.*').optional().isIn(FOCUS_WINDOWS),
  body('minBreakMinutes').optional().isInt({ min: 0, max: 120 }),
  body('emailRemindersEnabled').optional().isBoolean().toBoolean(),
  body('reminderLeadHours').optional().isInt({ min: 0, max: 168 }),
  body('schedulingStyle').optional().isIn(STYLES),
];

// --- Schedule generation --------------------------------------------------
const generateScheduleRules = [
  body('weekStart').isISO8601().withMessage('weekStart must be an ISO-8601 date (Monday of the week)').toDate(),
];

// --- Completion log -------------------------------------------------------
const completionRules = [
  body('taskId').isMongoId().withMessage('A valid taskId is required'),
  body('blockId').optional().isMongoId(),
  body('outcome').isIn(OUTCOMES).withMessage(`outcome must be one of: ${OUTCOMES.join(', ')}`),
  body('percentComplete').optional().isInt({ min: 0, max: 100 }),
  body('rescheduledTo').optional().isISO8601().toDate(),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

module.exports = {
  upsertAvailabilityRules,
  upsertPreferencesRules,
  generateScheduleRules,
  completionRules,
};
