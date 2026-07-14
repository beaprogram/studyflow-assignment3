const express = require('express');
const { getPreferences, upsertPreferences } = require('../controllers/preferenceController');
const { upsertPreferencesRules } = require('../validators/scheduleValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth, requireRole('student'));

router.get('/', getPreferences);
router.put('/', upsertPreferencesRules, validate, upsertPreferences);

module.exports = router;
