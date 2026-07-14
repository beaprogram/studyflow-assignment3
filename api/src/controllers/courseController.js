const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Course = require('../models/Course');
const Task = require('../models/Task');

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

  res.status(201).json({ course: course.toJSON() });
});

/**
 * GET /api/v1/courses    (IMPLEMENTED & DEPLOYED endpoint #2)
 * Lists the authenticated student's courses, newest first, with paging and an
 * optional term filter. Only the owner's records are ever returned.
 */
const listCourses = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const filter = { owner: req.user.id };
  if (req.query.term) filter.term = req.query.term;

  const [items, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({
    data: items.map((c) => c.toJSON()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
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
  res.status(204).send();
});

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse };
