const mongoose = require('mongoose');

const TASK_TYPES = ['assignment', 'reading', 'exam', 'project'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['not_started', 'in_progress', 'done', 'skipped'];

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: TASK_TYPES, default: 'assignment' },
    dueDate: { type: Date, required: true },
    estimatedHours: { type: Number, required: true, min: 0.5, max: 100 },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'not_started', index: true },
    notes: { type: String, trim: true, maxlength: 2000 }, // optional
  },
  { timestamps: true }
);

taskSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_TYPES = TASK_TYPES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
