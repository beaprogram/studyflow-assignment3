require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Course.syncIndexes();
  const idx = await Course.collection.indexes();
  console.log('indexes now:');
  idx.forEach((i) => console.log(' -', i.name, JSON.stringify(i.key)));
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
