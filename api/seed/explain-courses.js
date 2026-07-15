require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');
const OWNER = '650000000000000000000001'; // Maya

function walk(stage, cb) {
  if (!stage) return;
  cb(stage);
  walk(stage.inputStage, cb);
  if (stage.inputStages) stage.inputStages.forEach((s) => walk(s, cb));
}

function summarize(label, plan) {
  const stages = [];
  let indexName = null;
  walk(plan.executionStats.executionStages, (stage) => {
    stages.push(stage.stage);
    if (stage.indexName) indexName = stage.indexName;
  });

  return {
    label,
    stages: stages.join(' <- '),
    index: indexName || '(none / collection scan)',
    docsExamined: plan.executionStats.totalDocsExamined,
    keysExamined: plan.executionStats.totalKeysExamined,
    returned: plan.executionStats.nReturned,
    executionMs: plan.executionStats.executionTimeMillis,
  };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Read-only comparison. The $natural hint simulates the pre-index query
  // without dropping an index from the shared Atlas database.
  const withoutIndex = await Course.find({ owner: OWNER })
    .sort({ createdAt: -1 })
    .limit(20)
    .hint({ $natural: 1 })
    .explain('executionStats');

  const withIndex = await Course.find({ owner: OWNER })
    .sort({ createdAt: -1 })
    .limit(20)
    .explain('executionStats');

  for (const result of [
    summarize('Without compound index (simulated)', withoutIndex),
    summarize('With owner_1_createdAt_-1', withIndex),
  ]) {
    console.log(`\n${result.label}`);
    console.log('stages       :', result.stages);
    console.log('index used   :', result.index);
    console.log('docsExamined :', result.docsExamined);
    console.log('keysExamined :', result.keysExamined);
    console.log('nReturned    :', result.returned);
    console.log('exec time ms :', result.executionMs);
  }

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
