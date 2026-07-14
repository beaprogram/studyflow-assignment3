const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    // Owner of the course record. Every query is scoped by this field so one
    // student can never read or write another student's courses.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: { type: String, required: true, trim: true, maxlength: 20 }, // e.g. MKTG 3220
    title: { type: String, required: true, trim: true, maxlength: 160 },
    instructorName: { type: String, trim: true, maxlength: 120 }, // optional
    creditHours: { type: Number, min: 0, max: 12, default: 3 },
    colour: { type: String, default: '#6366F1', match: /^#([0-9A-Fa-f]{6})$/ },
    term: { type: String, trim: true, maxlength: 40 }, // optional, e.g. "Fall 2026"
  },
  { timestamps: true }
);

// A given student cannot have two courses with the same code in the same term.
courseSchema.index({ owner: 1, code: 1, term: 1 }, { unique: true });

courseSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Course', courseSchema);
