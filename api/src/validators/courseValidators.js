const { body, param, query } = require('express-validator');

const createCourseRules = [
  body('code').isString().trim().isLength({ min: 1, max: 20 }).withMessage('Course code is required'),
  body('title').isString().trim().isLength({ min: 1, max: 160 }).withMessage('Course title is required'),
  body('instructorName').optional().isString().trim().isLength({ max: 120 }),
  body('creditHours').optional().isFloat({ min: 0, max: 12 }).withMessage('creditHours must be 0-12'),
  body('colour').optional().matches(/^#([0-9A-Fa-f]{6})$/).withMessage('colour must be a hex code like #6366F1'),
  body('term').optional().isString().trim().isLength({ max: 40 }),
];

const updateCourseRules = [
  param('id').isMongoId().withMessage('Invalid course id'),
  body('code').optional().isString().trim().isLength({ min: 1, max: 20 }),
  body('title').optional().isString().trim().isLength({ min: 1, max: 160 }),
  body('instructorName').optional().isString().trim().isLength({ max: 120 }),
  body('creditHours').optional().isFloat({ min: 0, max: 12 }),
  body('colour').optional().matches(/^#([0-9A-Fa-f]{6})$/),
  body('term').optional().isString().trim().isLength({ max: 40 }),
];

const idParamRule = [param('id').isMongoId().withMessage('Invalid course id')];

const listCourseRules = [
  query('term').optional().isString().trim().isLength({ max: 40 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = { createCourseRules, updateCourseRules, idParamRule, listCourseRules };
