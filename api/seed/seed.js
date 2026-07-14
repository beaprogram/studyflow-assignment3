/**
 * seed.js
 * Wipes the StudyFlow collections and loads seed/studyflow.seed.json.
 * Passwords in the JSON are plaintext for readability; they are hashed here.
 *
 * Usage:
 *   1. Ensure .env has a valid MONGO_URI (and JWT_SECRET).
 *   2. npm run seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Task = require('../src/models/Task');
const Availability = require('../src/models/Availability');
const Preferences = require('../src/models/Preferences');
const Schedule = require('../src/models/Schedule');
const CompletionLog = require('../src/models/CompletionLog');
const { generatePlan, startOfDay } = require('../src/services/scheduler');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set. Copy .env.example to .env first.');
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);

  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'studyflow.seed.json'), 'utf-8')
  );

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Task.deleteMany({}),
    Availability.deleteMany({}),
    Preferences.deleteMany({}),
    Schedule.deleteMany({}),
    CompletionLog.deleteMany({}),
  ]);

  console.log('Inserting users (hashing passwords)...');
  for (const u of raw.users) {
    const passwordHash = await User.hashPassword(u.password);
    await User.create({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      passwordHash,
      role: u.role,
      status: u.status,
    });
  }

  console.log('Inserting courses, tasks, availability, preferences...');
  await Course.insertMany(raw.courses);
  await Task.insertMany(raw.tasks);
  await Availability.insertMany(raw.availabilities);
  await Preferences.insertMany(raw.preferences);

  // Generate one starter schedule for Maya so the data set includes a plan.
  console.log('Generating a sample schedule for Maya...');
  const mayaId = raw.users[0]._id;
  const tasks = await Task.find({ owner: mayaId, status: { $in: ['not_started', 'in_progress'] } });
  const avail = await Availability.findOne({ owner: mayaId });
  const prefs = await Preferences.findOne({ owner: mayaId });
  const weekStart = startOfDay('2026-11-09'); // Monday
  const blocks = generatePlan({
    weekStart,
    tasks: tasks.map((t) => t.toObject()),
    slots: avail.slots,
    preferences: prefs.toObject(),
  });
  await Schedule.create({ owner: mayaId, weekStart, status: 'active', blocks });

  const counts = {
    users: await User.countDocuments(),
    courses: await Course.countDocuments(),
    tasks: await Task.countDocuments(),
    availabilities: await Availability.countDocuments(),
    preferences: await Preferences.countDocuments(),
    schedules: await Schedule.countDocuments(),
  };
  console.log('Seed complete:', counts);
  console.log('Demo login -> email: maya@dal.ca  password: Password1!');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
