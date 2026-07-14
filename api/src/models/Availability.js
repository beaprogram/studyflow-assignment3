const mongoose = require('mongoose');

const STATES = ['available', 'blocked', 'class', 'work'];

// One painted cell on the weekly availability grid.
const slotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Mon ... 6 = Sun
    startHour: { type: Number, required: true, min: 0, max: 23 },
    endHour: { type: Number, required: true, min: 1, max: 24 },
    state: { type: String, enum: STATES, required: true },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    // One availability document per user (1:1).
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    timezone: { type: String, default: 'America/Halifax' },
    slots: { type: [slotSchema], default: [] },
  },
  { timestamps: true }
);

availabilitySchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Availability', availabilitySchema);
module.exports.STATES = STATES;
