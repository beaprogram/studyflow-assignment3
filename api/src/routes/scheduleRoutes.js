const express = require('express');
const {
  generateSchedule,
  getCurrentSchedule,
  logCompletion,
} = require('../controllers/scheduleController');
const {
  generateScheduleRules,
  completionRules,
} = require('../validators/scheduleValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth, requireRole('student'));

router.post('/generate', generateScheduleRules, validate, generateSchedule);
router.get('/current', getCurrentSchedule);
router.post('/completions', completionRules, validate, logCompletion);

module.exports = router;
