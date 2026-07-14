# StudyFlow — Assignment 3

Performance, resilience, and security work on the StudyFlow web application
(CSCI 4177/5709, Summer 2026).

StudyFlow is an AI study-scheduling app. This repository holds everything the
assignment requires in one place: the application code (front-end and API), the
JMeter load tests and results, the OWASP ZAP security scan and fixes, and the
Prometheus + Grafana monitoring setup.

## Repository layout

| Folder        | Contents                                                        | Rubric area |
|---------------|-----------------------------------------------------------------|-------------|
| `client/`     | React + Vite front-end. Client-side optimizations live here.    | Client-side optimizations |
| `api/`        | Node/Express + MongoDB API. Server-side optimizations live here.| Server-side optimizations |
| `jmeter/`     | JMeter test plan + baseline and optimized CSV results.          | Baseline + comparison |
| `zap/`        | OWASP ZAP report and remediation evidence.                      | Security scan |
| `monitoring/` | Prometheus config, Grafana dashboard, and screenshots.          | Monitoring |

Each folder has its own README describing what to run and what the files are.

## Application overview

- **API** (`api/`) is deployed on Render, backed by MongoDB Atlas. It exposes
  `/api/v1/auth/*`, `/api/v1/courses`, and the other StudyFlow endpoints.
- **Client** (`client/`) is deployed on Netlify and talks to the API. In both
  dev and production, `/api/*` is proxied to the Render backend, so there is no
  CORS to configure (see `client/vite.config.js` and `client/netlify.toml`).

## The four optimizations

Client-side (in `client/`):
1. Lazy-load the heavy Analytics route (code-splits the recharts library out of
   the main bundle).
2. Memoize the course list and its derived data (avoids re-computing and
   re-rendering on unrelated state changes).

Server-side (in `api/`):
1. In-memory caching of read-heavy endpoints.
2. MongoDB indexing on the fields used to query and sort.

Each is applied after the baseline is recorded, then re-measured. See
`jmeter/README.md` for the before/after method.

## Live URLs

- API base: `https://studyflow-api-yzno.onrender.com`
- Client: _added after the Netlify deploy._
