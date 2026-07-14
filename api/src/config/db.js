const mongoose = require('mongoose');

/**
 * Connect to MongoDB. Called once from server.js at start-up.
 * app.js itself does NOT call this, which keeps the Express app importable in
 * tests without needing a live database.
 */
async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
