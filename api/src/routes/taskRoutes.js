const express = require('express');
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskRules,
  updateTaskRules,
  idParamRule,
  listTaskRules,
} = require('../validators/taskValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth, requireRole('student'));

router.post('/', createTaskRules, validate, createTask);
router.get('/', listTaskRules, validate, listTasks);
router.get('/:id', idParamRule, validate, getTask);
router.patch('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', idParamRule, validate, deleteTask);

module.exports = router;
