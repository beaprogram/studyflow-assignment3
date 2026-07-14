const { body, param, query } = require('express-validator');
const { TASK_TYPES, PRIORITIES, STATUSES } = require('../models/Task');

const createTaskRules = [
  body('courseId').isMongoId().withMessage('A valid courseId is required'),
  body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('type').optional().isIn(TASK_TYPES).withMessage(`type must be one of: ${TASK_TYPES.join(', ')}`),
  body('dueDate').isISO8601().withMessage('dueDate must be an ISO-8601 date').toDate(),
  body('estimatedHours').isFloat({ min: 0.5, max: 100 }).withMessage('estimatedHours must be 0.5-100'),
  body('priority').optional().isIn(PRIORITIES).withMessage(`priority must be one of: ${PRIORITIES.join(', ')}`),
  body('notes').optional().isString().trim().isLength({ max: 2000 }),
];

const updateTaskRules = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('type').optional().isIn(TASK_TYPES),
  body('dueDate').optional().isISO8601().toDate(),
  body('estimatedHours').optional().isFloat({ min: 0.5, max: 100 }),
  body('priority').optional().isIn(PRIORITIES),
  body('status').optional().isIn(STATUSES),
  body('notes').optional().isString().trim().isLength({ max: 2000 }),
];

const idParamRule = [param('id').isMongoId().withMessage('Invalid task id')];

const listTaskRules = [
  query('courseId').optional().isMongoId().withMessage('Invalid courseId'),
  query('status').optional().isIn(STATUSES),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = { createTaskRules, updateTaskRules, idParamRule, listTaskRules };
