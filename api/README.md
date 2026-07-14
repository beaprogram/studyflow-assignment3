# StudyFlow API

REST API for **StudyFlow** (CSCI 4177/5709 Web Services — Assignment 2).
Node.js / Express / MongoDB (Mongoose). Implements three core features —
**Course & Task Management**, **Availability & Preferences**, and the
**Adaptive AI Study Scheduler** — plus the security endpoints (registration,
login, JWT auth, RBAC, validation).

---

## Tech stack

| Concern            | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Runtime            | Node.js 18+                                          |
| Framework          | Express 4                                           |
| Database / ODM     | MongoDB + Mongoose 8                                 |
| Auth               | JWT (`jsonwebtoken`) + bcrypt password hashing      |
| Validation         | `express-validator`                                 |
| Hardening          | `helmet`, `express-mongo-sanitize`, `express-rate-limit`, CORS allow-list |

## Project structure

```
studyflow-api/
├── server.js                 # entry point: connect DB, start server
├── src/
│   ├── app.js                # builds the Express app (security mw + routes)
│   ├── config/db.js          # Mongo connection
│   ├── models/               # User, Course, Task, Availability, Preferences,
│   │                         #   Schedule, CompletionLog
│   ├── middleware/           # auth (JWT), requireRole (RBAC), validate,
│   │                         #   errorHandler, notFound
│   ├── validators/           # express-validator chains per resource
│   ├── controllers/          # request handlers
│   ├── routes/               # route definitions
│   ├── services/scheduler.js # rule-based study-block planner
│   └── utils/                # ApiError, asyncHandler, token
├── seed/
│   ├── studyflow.seed.json   # sample data (the assignment's .json data file)
│   ├── seed.js               # loads the JSON into MongoDB (hashes passwords)
│   └── erd.dot               # Graphviz source for the ERD
├── postman/StudyFlow.postman_collection.json
└── tests/smoke.test.js       # node:test + supertest (no DB needed)
```

---

## Run locally

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
#    Edit .env: set MONGO_URI (local or Atlas) and a long random JWT_SECRET.

# 3. Seed sample data (optional but recommended)
npm run seed
#    -> creates Maya (student), Dr. Tanaka (instructor), Admin User
#    -> demo login: maya@dal.ca / Password1!

# 4. Start
npm start          # or: npm run dev  (auto-reload via nodemon)

# 5. Verify
curl http://localhost:5000/api/v1/health
```

Run the test suite (no database required — it exercises the security and
validation middleware):

```bash
npm test
```

---

## API summary

Base path: `/api/v1`. All non-auth routes require `Authorization: Bearer <token>`.

### Security
| Method | Path             | Purpose                          |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Create account (student/instructor) |
| POST   | `/auth/login`    | Obtain JWT                       |
| GET    | `/auth/me`       | Current user profile             |

### Course & Task Management
| Method | Path            | Purpose            |
| ------ | --------------- | ------------------ |
| POST   | `/courses`      | Create a course    |
| GET    | `/courses`      | List courses (paged, `?term=`) |
| GET    | `/courses/:id`  | Get one course     |
| PATCH  | `/courses/:id`  | Update a course    |
| DELETE | `/courses/:id`  | Delete a course (cascades tasks) |
| POST   | `/tasks`        | Create a task      |
| GET    | `/tasks`        | List tasks (`?courseId=`, `?status=`) |
| GET    | `/tasks/:id`    | Get one task       |
| PATCH  | `/tasks/:id`    | Update a task      |
| DELETE | `/tasks/:id`    | Delete a task      |

### Availability & Preferences
| Method | Path            | Purpose                       |
| ------ | --------------- | ----------------------------- |
| GET    | `/availability` | Get weekly availability grid  |
| PUT    | `/availability` | Replace availability grid     |
| GET    | `/preferences`  | Get study preferences         |
| PUT    | `/preferences`  | Update study preferences      |

### Adaptive AI Study Scheduler
| Method | Path                     | Purpose                          |
| ------ | ------------------------ | -------------------------------- |
| POST   | `/schedule/generate`     | Build the week's study plan      |
| GET    | `/schedule/current`      | Get active plan (`?weekStart=`)  |
| POST   | `/schedule/completions`  | Log how a block/task went        |

All error responses share one envelope:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ ... ] } }
```

---

## Deploy to Render + MongoDB Atlas (free tier)

> These are the steps **you** run from your own accounts. The API itself is
> deploy-ready; nothing in the code needs to change.

### A. MongoDB Atlas (database)
1. Create a free account at mongodb.com/atlas and create an **M0** free cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — Render's IPs are dynamic).
4. **Connect → Drivers** → copy the connection string. It looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/studyflow?retryWrites=true&w=majority`.

### B. Push code to GitHub
```bash
git init && git add . && git commit -m "StudyFlow API"
git branch -M main
git remote add origin https://github.com/<you>/studyflow-api.git
git push -u origin main
```

### C. Render (web service)
1. render.com → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment** → add variables:
   - `MONGO_URI` = your Atlas string from step A4
   - `JWT_SECRET` = a long random string
   - `JWT_EXPIRES_IN` = `2h`
   - `CORS_ORIGINS` = your front-end URL(s)
   - `NODE_ENV` = `production`
4. Deploy. Your base URL will be `https://<service-name>.onrender.com`.
5. Seed the deployed DB once: locally set `.env`'s `MONGO_URI` to the **same**
   Atlas string and run `npm run seed`, **or** add a one-off Render job.
6. Smoke test: open `https://<service-name>.onrender.com/api/v1/health`.

> Render's free tier sleeps after inactivity; the first request after idle can
> take ~30–50s to wake. Mention this in your demo so a slow first call is not
> mistaken for a failure.

---

## Capturing the Postman evidence (rubric)

1. Import `postman/StudyFlow.postman_collection.json` into Postman.
2. Set the `baseUrl` collection variable to your Render URL.
3. Run the requests top to bottom. **Login** auto-saves the JWT into `{{token}}`;
   **Create course** auto-saves `{{courseId}}`.
4. Screenshot each response for the report. The collection already includes the
   cases the rubric asks for:
   - success (201 create course, 200 list courses)
   - validation error (422 — "Create course (invalid)")
   - auth failure (401 — "Create course (no token)", "Login wrong password")
   - auth success (200 login)
   - persistence: run "List courses" again after re-login to show the data
     survived (it is read back from MongoDB, not from memory).

---

## What is left for the team to do

The four things only you can do from your own accounts:
1. **Deploy** to Render (steps above) and record the live base URL.
2. **Capture** the annotated Postman screenshots from the live service.
3. **Push** the source to GitHub and paste the repo link in the report.
4. **Paste** the live endpoint URLs into Section 5 of the report where marked.
