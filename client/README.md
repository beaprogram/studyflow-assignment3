# StudyFlow Client

A small React + Vite front-end for the StudyFlow API. Built as the performance
target for Assignment 3 (JMeter load testing, client-side optimizations, and
before/after comparison).

It covers three flows against the live API:

- **Sign in** (`POST /api/v1/auth/login`)
- **List courses** (`GET /api/v1/courses`)
- **Create a course** (`POST /api/v1/courses`)
- **Analytics** — a recharts dashboard derived from your courses (the heavy
  route used to demonstrate lazy loading).

## Prerequisites

- Node.js 18+ and npm

## Run locally

```
cd studyflow-web
npm install
npm run dev
```

Open http://localhost:5173 and sign in with the demo student account:

```
maya@dal.ca / Password1!
```

The app calls the relative path `/api/...`. In development, Vite proxies that
to the live Render backend (see `vite.config.js`), so there is no CORS to set
up and you do not need to run the backend locally.

## Build (for JMeter and deployment)

```
cd studyflow-web
npm run build
```

The production bundle is written to `dist/`. Vite emits a hashed entry bundle
at `dist/assets/index-<hash>.js` (this is the equivalent of the
`main.<hash>.js` file the assignment brief refers to). The exact filename is
printed at the end of the build and also visible in `dist/index.html`.

To serve the production build locally:

```
npm run preview
```

## Deploy to Netlify

`netlify.toml` is already configured:

- Build command `npm run build`, publish directory `dist`.
- A proxy redirect sends `/api/*` to the Render backend, so the deployed site
  is same-origin with its API (no CORS changes needed on the backend).
- An SPA fallback serves `index.html` for client-side routes.

Connect the repo in Netlify (or drag the `dist/` folder into the Netlify
dashboard) and deploy.

## JMeter targets

- **API endpoints:** call the Render backend directly, e.g.
  `https://studyflow-api-yzno.onrender.com/api/v1/courses`.
- **Front-end bundle:** the deployed site's `index.html` and
  `assets/index-<hash>.js`.

Note: the Render free tier sleeps when idle, so warm the service with one
request before recording a baseline, or the first sample will include cold-start
time.
