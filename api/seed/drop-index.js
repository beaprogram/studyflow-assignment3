require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await Course.collection.dropIndex('owner_1_createdAt_-1');
    console.log('dropped owner_1_createdAt_-1');
  } catch (e) {
    console.log('index not present (already dropped)');
  }
  const idx = await Course.collection.indexes();
  console.log('indexes now:');
  idx.forEach((i) => console.log(' -', i.name));
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
