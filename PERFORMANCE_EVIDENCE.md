# Performance Evidence

This file ties each optimization to a repeatable measurement. The submitted
JMeter CSVs remain the source of record for the before/after load-test results.

## Client optimization 1 - route-level code splitting

The Analytics route and Recharts are loaded with `React.lazy`, so the charting
code is no longer part of the initial JavaScript entry bundle.

- Baseline entry bundle: 578,126 bytes
- Optimized entry bundle: 177,350 bytes
- Reduction: 400,776 bytes, or 69.3%

Implementation: `client/src/App.jsx`

## Client optimization 2 - memoized course list

`CourseRow` uses `React.memo`; derived summary data and the row collection use
`useMemo`; the loading callback uses `useCallback`.

Run `cd client && npm run benchmark:memo` to execute the deterministic render
benchmark with 20 stable course rows and 50 unrelated parent updates.

- Baseline row renders: 1,020
- Optimized row renders: 20
- Avoided renders: 1,000, or 98.0%

Implementation: `client/src/pages/Courses.jsx`

## Server optimization 1 - short-lived read cache

Course-list responses are cached per user and query for 30 seconds. Create,
update, and delete operations invalidate the affected user's cached lists.
Responses expose `X-Cache: MISS`, `HIT`, or `DISABLED` for verification.

With caching and indexing enabled, the submitted JMeter runs show course-list
average latency reductions of 48.5% under light load and 51.3% under moderate
load, with a 0.00% error rate in both optimized runs.

Implementation: `api/src/utils/cache.js` and
`api/src/controllers/courseController.js`

## Server optimization 2 - compound MongoDB index

The course list filters on `owner` and sorts newest-first, so the model defines
the compound index `{ owner: 1, createdAt: -1 }`.

Run `cd api && npm run explain:courses` against the seeded Atlas database. The
read-only comparison uses a forced collection scan for the baseline and the
compound index for the optimized query.

- Baseline plan: `SORT <- COLLSCAN`; 10,006 documents examined; 11 ms
- Optimized plan: `LIMIT <- FETCH <- IXSCAN`; 20 documents and 20 keys examined; 1 ms
- Documents examined reduction: 99.8%
- Query execution time reduction: 90.9%

Implementation: `api/src/models/Course.js` and
`api/seed/explain-courses.js`
