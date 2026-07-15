require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

// Maya's user id (from the seed data / JWT subject).
const OWNER = '650000000000000000000001';
const COUNT = Number(process.argv[2]) || 10000;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected to Atlas');

  // Idempotent: clear any previous load-test courses first (leaves real ones).
  const del = await Course.deleteMany({ owner: OWNER, code: /^LOAD-/ });
  console.log(`cleared ${del.deletedCount} previous load-test courses`);

  const batchSize = 1000;
  let inserted = 0;
  for (let start = 0; start < COUNT; start += batchSize) {
    const docs = [];
    for (let i = start; i < Math.min(start + batchSize, COUNT); i++) {
      docs.push({
        owner: OWNER,
        code: `LOAD-${i}`,
        title: `Load Test Course ${i}`,
        instructorName: 'Perf Bot',
        creditHours: 3,
        term: 'Perf 2026',
      });
    }
    await Course.insertMany(docs, { ordered: false });
    inserted += docs.length;
    process.stdout.write(`\rinserted ${inserted}/${COUNT}`);
  }

  const total = await Course.countDocuments({ owner: OWNER });
  console.log(`\ndone. Maya now owns ${total} courses total.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
