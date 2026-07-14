const express = require('express');
const { getAvailability, upsertAvailability } = require('../controllers/availabilityController');
const { upsertAvailabilityRules } = require('../validators/scheduleValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth, requireRole('student'));

router.get('/', getAvailability);
router.put('/', upsertAvailabilityRules, validate, upsertAvailability);

module.exports = router;
