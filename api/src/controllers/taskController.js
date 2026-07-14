const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Task = require('../models/Task');
const Course = require('../models/Course');

// Confirms the referenced course exists AND belongs to the caller. Prevents a
// student from attaching tasks to someone else's course (broken-access-control
// defence).
async function assertOwnedCourse(courseId, userId) {
  const course = await Course.findOne({ _id: courseId, owner: userId });
  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

/**
 * POST /api/v1/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const { courseId, title, type, dueDate, estimatedHours, priority, notes } = req.body;
  await assertOwnedCourse(courseId, req.user.id);

  const task = await Task.create({
    owner: req.user.id,
    course: courseId,
    title,
    type,
    dueDate,
    estimatedHours,
    priority,
    notes,
  });
  res.status(201).json({ task: task.toJSON() });
});

/**
 * GET /api/v1/tasks
 * Optional filters: courseId, status. Paged.
 */
const listTasks = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  const filter = { owner: req.user.id };
  if (req.query.courseId) filter.course = req.query.courseId;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    data: items.map((t) => t.toJSON()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * GET /api/v1/tasks/:id
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
  if (!task) throw ApiError.notFound('Task not found');
  res.json({ task: task.toJSON() });
});

/**
 * PATCH /api/v1/tasks/:id
 */
const updateTask = asyncHandler(async (req, res) => {
  const allowed = ['title', 'type', 'dueDate', 'estimatedHours', 'priority', 'status', 'notes'];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!task) throw ApiError.notFound('Task not found');
  res.json({ task: task.toJSON() });
});

/**
 * DELETE /api/v1/tasks/:id
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!task) throw ApiError.notFound('Task not found');
  res.status(204).send();
});

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };
