require('dotenv').config();
const connectDB = require('./src/config/db');
const buildApp = require('./src/app');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGO_URI) {
    // eslint-disable-next-line no-console
    console.error('FATAL: MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('FATAL: JWT_SECRET is not set.');
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);
  const app = buildApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`StudyFlow API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
