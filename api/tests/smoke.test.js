/**
 * Smoke tests that exercise the security middleware, routing, validation and
 * error envelope WITHOUT needing a database connection. Run with: npm test
 *
 * These cover the paths that do not touch MongoDB (health, 404, auth guards,
 * input validation). Full CRUD flows are demonstrated against the live
 * deployment with Postman (see /postman and the report).
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.NODE_ENV = 'test';

// These requests deliberately stop before any database operation. Stub the
// model modules so this smoke suite stays independent of MongoDB and does not
// spend time loading Mongoose just to exercise middleware and validation.
function stubModel(relativePath, exports) {
  const filename = require.resolve(relativePath);
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}

stubModel('../src/models/User', {
  ROLES: ['student', 'instructor', 'admin'],
});
stubModel('../src/models/Task', {
  TASK_TYPES: ['assignment', 'reading', 'exam', 'project'],
  PRIORITIES: ['low', 'medium', 'high'],
  STATUSES: ['not_started', 'in_progress', 'done', 'skipped'],
});
stubModel('../src/models/Availability', {
  STATES: ['available', 'blocked', 'class', 'work'],
});
stubModel('../src/models/Preferences', {
  FOCUS_WINDOWS: ['morning', 'afternoon', 'evening', 'late_night'],
  STYLES: ['conservative', 'balanced', 'aggressive'],
});
stubModel('../src/models/CompletionLog', {
  OUTCOMES: ['completed', 'partial', 'skipped', 'rescheduled'],
});
stubModel('../src/models/Course', {});
stubModel('../src/models/Schedule', {});

const buildApp = require('../src/app');
const app = buildApp();

// Supertest can create an implicit listener from an Express app, but that
// listener is not resolved reliably by Node 25's test runner. Owning the test
// server explicitly also guarantees that the port is closed after the suite.
let server;
let baseUrl;

before(
  () =>
    new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
      server.on('error', reject);
    })
);

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })
);

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { status: response.status, body: await response.json() };
}

test('GET /api/v1/health returns ok', async () => {
  const r = await api('/api/v1/health');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.status, 'ok');
});

test('unknown route returns 404 NOT_FOUND', async () => {
  const r = await api('/api/v1/does-not-exist');
  assert.strictEqual(r.status, 404);
  assert.strictEqual(r.body.error.code, 'NOT_FOUND');
});

test('protected route without token returns 401', async () => {
  const r = await api('/api/v1/courses');
  assert.strictEqual(r.status, 401);
  assert.strictEqual(r.body.error.code, 'UNAUTHENTICATED');
});

test('protected route with bad token returns 401 INVALID_TOKEN', async () => {
  const r = await api('/api/v1/courses', {
    headers: { Authorization: 'Bearer garbage' },
  });
  assert.strictEqual(r.status, 401);
  assert.strictEqual(r.body.error.code, 'INVALID_TOKEN');
});

test('register with invalid input returns 422 with field details', async () => {
  const r = await api('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'weak' }),
  });
  assert.strictEqual(r.status, 422);
  assert.strictEqual(r.body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(r.body.error.details));
});

test('login missing password returns 422', async () => {
  const r = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@b.com' }),
  });
  assert.strictEqual(r.status, 422);
});
