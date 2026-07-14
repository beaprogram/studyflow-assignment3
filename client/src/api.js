// Thin client over the StudyFlow API.
//
// Requests go to a relative "/api/..." path by default, which the Vite dev
// server and Netlify both proxy to the live Render backend (see vite.config.js
// and netlify.toml). Set VITE_API_BASE only if you want to hit the backend
// directly (requires CORS on the API side).

const BASE = import.meta.env.VITE_API_BASE ?? ''
const API = `${BASE}/api/v1`

// A failed request throws an ApiError carrying the HTTP status and the parsed
// error body, so callers can show the API's own messages (e.g. 422 details).
export class ApiError extends Error {
  constructor(status, body) {
    const message =
      body?.error?.message || body?.message || `Request failed (${status})`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.details = body?.error?.details || []
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    // The Render free tier sleeps when idle, so the first call after a while
    // can be slow or briefly fail while the service wakes up.
    throw new ApiError(0, {
      message:
        'Could not reach the server. If this is the first request in a while, the free-tier backend may be waking up. Wait a few seconds and try again.',
    })
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function listCourses(token, { page = 1, limit = 20, term } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (term) qs.set('term', term)
  return request(`/courses?${qs.toString()}`, { token })
}

export function createCourse(token, course) {
  return request('/courses', { method: 'POST', token, body: course })
}
