/**
 * Smoke tests that exercise the security middleware, routing, validation and
 * error envelope WITHOUT needing a database connection. Run with: npm test
 *
 * These cover the paths that do not touch MongoDB (health, 404, auth guards,
 * input validation). Full CRUD flows are demonstrated against the live
 * deployment with Postman (see /postman and the report).
 */
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.NODE_ENV = 'test';

const buildApp = require('../src/app');
const app = buildApp();

test('GET /api/v1/health returns ok', async () => {
  const r = await request(app).get('/api/v1/health');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.status, 'ok');
});

test('unknown route returns 404 NOT_FOUND', async () => {
  const r = await request(app).get('/api/v1/does-not-exist');
  assert.strictEqual(r.status, 404);
  assert.strictEqual(r.body.error.code, 'NOT_FOUND');
});

test('protected route without token returns 401', async () => {
  const r = await request(app).get('/api/v1/courses');
  assert.strictEqual(r.status, 401);
  assert.strictEqual(r.body.error.code, 'UNAUTHENTICATED');
});

test('protected route with bad token returns 401 INVALID_TOKEN', async () => {
  const r = await request(app).get('/api/v1/courses').set('Authorization', 'Bearer garbage');
  assert.strictEqual(r.status, 401);
  assert.strictEqual(r.body.error.code, 'INVALID_TOKEN');
});

test('register with invalid input returns 422 with field details', async () => {
  const r = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'not-an-email', password: 'weak' });
  assert.strictEqual(r.status, 422);
  assert.strictEqual(r.body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(r.body.error.details));
});

test('login missing password returns 422', async () => {
  const r = await request(app).post('/api/v1/auth/login').send({ email: 'a@b.com' });
  assert.strictEqual(r.status, 422);
});
