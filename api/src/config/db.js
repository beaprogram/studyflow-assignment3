const mongoose = require('mongoose');

/**
 * Connect to MongoDB. Called once from server.js at start-up.
 * app.js itself does NOT call this, which keeps the Express app importable in
 * tests without needing a live database.
 */
async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  // Mongoose builds every index declared in a schema when it connects. That is
  // convenient in normal use, but it would silently re-create the compound
  // index during the "before" measurement run. AUTO_INDEX=false disables that
  // so the baseline can be captured without it.
  const autoIndex = process.env.AUTO_INDEX !== 'false';

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex,
  });
  // eslint-disable-next-line no-console
  console.log(
    `MongoDB connected: ${conn.connection.host}/${conn.connection.name} (autoIndex=${autoIndex})`
  );
  return conn;
}

module.exports = connectDB;
