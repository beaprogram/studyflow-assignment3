const mongoose = require('mongoose');

const OUTCOMES = ['completed', 'partial', 'skipped', 'rescheduled'];

const completionLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    // The block this outcome refers to (optional - a student can log an
    // outcome on a task that was never scheduled).
    blockId: { type: mongoose.Schema.Types.ObjectId },
    outcome: { type: String, enum: OUTCOMES, required: true },
    percentComplete: { type: Number, min: 0, max: 100 }, // only for "partial"
    rescheduledTo: { type: Date }, // only for "rescheduled"
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

completionLogSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('CompletionLog', completionLogSchema);
module.exports.OUTCOMES = OUTCOMES;
