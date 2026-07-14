const mongoose = require('mongoose');

// A single AI-placed study block on the calendar.
const blockSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    // Human-readable explanation shown in the rationale popover. This is the
    // app's core transparency feature.
    rationale: { type: String, required: true, maxlength: 500 },
  },
  { _id: true }
);

const scheduleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // ISO date (Monday) identifying the week this plan covers.
    weekStart: { type: Date, required: true },
    status: { type: String, enum: ['active', 'superseded'], default: 'active', index: true },
    blocks: { type: [blockSchema], default: [] },
  },
  { timestamps: true }
);

// At most one ACTIVE schedule per user per week.
scheduleSchema.index(
  { owner: 1, weekStart: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

scheduleSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
