# StudyFlow - Assignment 3

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
- **Client** (`client/`) is a production Vite build. In development and on
  Netlify, `/api/*` is proxied to the API so browser requests remain same-origin
  (see `client/vite.config.js` and `client/netlify.toml`).

## The four optimizations

Client-side (in `client/`):
1. Lazy-load the heavy Analytics route (code-splits the recharts library out of
   the main bundle).
2. Memoize the course list and its derived data (avoids re-computing and
   re-rendering on unrelated state changes).

Server-side (in `api/`):
1. In-memory caching of read-heavy endpoints.
2. MongoDB indexing on the fields used to query and sort.

Each was applied after the baseline was recorded, then measured with the same
JMeter plan. See `jmeter/README.md` for the before/after method and results.

## Verification status

- API smoke tests: 6/6 passing.
- Client production build: passing; the main JavaScript bundle is 69.3% smaller
  after code splitting.
- JMeter: 4,808 submitted samples across four runs, 0.00% errors.
- OWASP ZAP: final scan has no high- or medium-risk findings.
- Monitoring: Prometheus target healthy; Grafana has six required panels.

## Submission artifacts

- `deliverables/StudyFlow_Assignment3_Report.pdf` - Brightspace report.
- `deliverables/StudyFlow_Assignment3_Report.docx` - editable report copy.
- `deliverables/Brightspace_Submission_Checklist.md` - final submission steps.
- Git repository: `https://github.com/beaprogram/studyflow-assignment3`

API deployment: `https://studyflow-api-yzno.onrender.com`
