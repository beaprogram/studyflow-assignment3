const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Task = require('../models/Task');
const Availability = require('../models/Availability');
const Preferences = require('../models/Preferences');
const Schedule = require('../models/Schedule');
const CompletionLog = require('../models/CompletionLog');
const { generatePlan, startOfDay } = require('../services/scheduler');

/**
 * POST /api/v1/schedule/generate
 * Builds (or rebuilds) the active study schedule for the given week from the
 * caller's open tasks, availability, and preferences. Any previous active plan
 * for that week is marked "superseded" so history is preserved but only one
 * plan is active at a time.
 */
const generateSchedule = asyncHandler(async (req, res) => {
  const weekStart = startOfDay(req.body.weekStart);

  const [tasks, availability, preferences] = await Promise.all([
    Task.find({ owner: req.user.id, status: { $in: ['not_started', 'in_progress'] } }),
    Availability.findOne({ owner: req.user.id }),
    Preferences.findOne({ owner: req.user.id }),
  ]);

  if (!availability || availability.slots.length === 0) {
    throw ApiError.badRequest(
      'No availability found. Set your weekly availability before generating a schedule.',
      'NO_AVAILABILITY'
    );
  }

  const blocks = generatePlan({
    weekStart,
    tasks: tasks.map((t) => t.toObject()),
    slots: availability.slots,
    preferences: preferences ? preferences.toObject() : {},
  });

  // Supersede any existing active plan for this week.
  await Schedule.updateMany(
    { owner: req.user.id, weekStart, status: 'active' },
    { $set: { status: 'superseded' } }
  );

  const schedule = await Schedule.create({
    owner: req.user.id,
    weekStart,
    status: 'active',
    blocks,
  });

  res.status(201).json({
    schedule: schedule.toJSON(),
    summary: {
      blockCount: blocks.length,
      tasksConsidered: tasks.length,
      unscheduledHours: estimateUnscheduled(tasks.map((t) => t.toObject()), blocks),
    },
  });
});

function estimateUnscheduled(tasks, blocks) {
  const scheduledHours = {};
  blocks.forEach((b) => {
    const id = b.task.toString();
    scheduledHours[id] = (scheduledHours[id] || 0) + 1;
  });
  let remaining = 0;
  tasks.forEach((t) => {
    const done = scheduledHours[t._id.toString()] || 0;
    remaining += Math.max(0, t.estimatedHours - done);
  });
  return remaining;
}

/**
 * GET /api/v1/schedule/current?weekStart=ISO
 * Returns the active schedule for the requested week.
 */
const getCurrentSchedule = asyncHandler(async (req, res) => {
  if (!req.query.weekStart) {
    throw ApiError.badRequest('weekStart query parameter is required', 'MISSING_WEEK');
  }
  const weekStart = startOfDay(req.query.weekStart);
  const schedule = await Schedule.findOne({ owner: req.user.id, weekStart, status: 'active' });
  if (!schedule) throw ApiError.notFound('No active schedule for that week');
  res.json({ schedule: schedule.toJSON() });
});

/**
 * POST /api/v1/schedule/completions
 * Records how a study block/task actually went. This is the feedback loop the
 * scheduler learns from. Logging "completed" also flips the task to done.
 */
const logCompletion = asyncHandler(async (req, res) => {
  const { taskId, blockId, outcome, percentComplete, rescheduledTo, notes } = req.body;

  const task = await Task.findOne({ _id: taskId, owner: req.user.id });
  if (!task) throw ApiError.notFound('Task not found');

  const log = await CompletionLog.create({
    owner: req.user.id,
    task: taskId,
    blockId,
    outcome,
    percentComplete,
    rescheduledTo,
    notes,
  });

  // Reflect the outcome on the task where it makes sense.
  if (outcome === 'completed') task.status = 'done';
  else if (outcome === 'partial') task.status = 'in_progress';
  else if (outcome === 'skipped') task.status = 'skipped';
  await task.save();

  res.status(201).json({ completion: log.toJSON(), task: task.toJSON() });
});

module.exports = { generateSchedule, getCurrentSchedule, logCompletion };
