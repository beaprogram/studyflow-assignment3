const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Course = require('../models/Course');
const Task = require('../models/Task');
const cache = require('../utils/cache');

// Cached list responses live for this long. Short enough that data feels fresh,
// long enough to absorb bursts of repeated reads. Writes invalidate immediately
// regardless, so a stale read can never outlast a change.
const LIST_TTL_MS = 30 * 1000;

// Optimizations can be switched off for the baseline measurement run so that
// "before" and "after" are captured under otherwise identical conditions.
// Set CACHE_ENABLED=false to bypass the cache entirely.
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';

// All cache keys for one user's course lists share this prefix, so a single
// write can clear every page/filter variant the user has cached.
const listPrefix = (userId) => `courses:list:${userId}:`;

/**
 * POST /api/v1/courses   (IMPLEMENTED & DEPLOYED endpoint #1)
 * Creates a course owned by the authenticated student.
 */
const createCourse = asyncHandler(async (req, res) => {
  const { code, title, instructorName, creditHours, colour, term } = req.body;

  const course = await Course.create({
    owner: req.user.id, // ownership is taken from the token, never the body
    code,
    title,
    instructorName,
    creditHours,
    colour,
    term,
  });

  cache.delByPrefix(listPrefix(req.user.id)); // new course -> drop cached lists
  res.status(201).json({ course: course.toJSON() });
});

/**
 * GET /api/v1/courses    (IMPLEMENTED & DEPLOYED endpoint #2)
 * Lists the authenticated student's courses, newest first, with paging and an
 * optional term filter. Served from an in-memory cache when available.
 */
const listCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const term = req.query.term || '';

  // Cache key covers everything that changes the result for this user.
  const key = `${listPrefix(req.user.id)}${page}:${limit}:${term}`;

  const cached = CACHE_ENABLED ? cache.get(key) : undefined;
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  const filter = { owner: req.user.id };
  if (term) filter.term = term;

  const [items, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  const payload = {
    data: items.map((c) => c.toJSON()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  if (CACHE_ENABLED) cache.set(key, payload, LIST_TTL_MS);
  res.set('X-Cache', CACHE_ENABLED ? 'MISS' : 'DISABLED');
  res.json(payload);
});

/**
 * GET /api/v1/courses/:id
 */
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, owner: req.user.id });
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ course: course.toJSON() });
});

/**
 * PATCH /api/v1/courses/:id
 */
const updateCourse = asyncHandler(async (req, res) => {
  const allowed = ['code', 'title', 'instructorName', 'creditHours', 'colour', 'term'];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!course) throw ApiError.notFound('Course not found');

  cache.delByPrefix(listPrefix(req.user.id)); // changed course -> drop cached lists
  res.json({ course: course.toJSON() });
});

/**
 * DELETE /api/v1/courses/:id
 * Removes the course and its tasks (cascade) so no orphan tasks remain.
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!course) throw ApiError.notFound('Course not found');
  await Task.deleteMany({ course: course._id, owner: req.user.id });

  cache.delByPrefix(listPrefix(req.user.id)); // removed course -> drop cached lists
  res.status(204).send();
});

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse };
