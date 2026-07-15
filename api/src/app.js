const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { metricsMiddleware, metricsHandler } = require('./utils/metrics');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

function buildApp() {
  const app = express();

  // --- Security & hardening ------------------------------------------------
  // Record timing and outcome for every request. Registered first so that the
  // histogram measures the full time spent inside Express, including all the
  // middleware below it.
  app.use(metricsMiddleware);

  app.use(helmet()); // sensible secure HTTP headers
  app.use(
    cors({
      origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' })); // cap body size (DoS defence)
  app.use(mongoSanitize()); // strip $ and . from keys -> NoSQL injection defence
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Prometheus scrape endpoint. Declared BEFORE the rate limiter: Prometheus
  // polls this every few seconds and must never be throttled, and the endpoint
  // exposes only aggregate counters, no user data.
  app.get('/metrics', metricsHandler);

  // Global, per-IP rate limit across the whole API (security control).
  // The ceiling is configurable via RATE_LIMIT_MAX so a single-IP load test
  // can raise it; the same value is used for baseline and optimized runs.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_MAX) || 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // --- Health check --------------------------------------------------------
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', service: 'studyflow-api', time: new Date().toISOString() });
  });

  // --- Feature routes ------------------------------------------------------
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/courses', courseRoutes);
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api/v1/availability', availabilityRoutes);
  app.use('/api/v1/preferences', preferenceRoutes);
  app.use('/api/v1/schedule', scheduleRoutes);

  // --- Fallbacks -----------------------------------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;
