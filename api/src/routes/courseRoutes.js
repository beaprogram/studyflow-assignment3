const express = require('express');
const {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const {
  createCourseRules,
  updateCourseRules,
  idParamRule,
  listCourseRules,
} = require('../validators/courseValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Every route below requires a valid token and the student role.
router.use(requireAuth, requireRole('student'));

router.post('/', createCourseRules, validate, createCourse);
router.get('/', listCourseRules, validate, listCourses);
router.get('/:id', idParamRule, validate, getCourse);
router.patch('/:id', updateCourseRules, validate, updateCourse);
router.delete('/:id', idParamRule, validate, deleteCourse);

module.exports = router;
