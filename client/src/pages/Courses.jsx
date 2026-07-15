import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { listCourses } from '../api.js'

// CLIENT-SIDE OPTIMIZATION 2: memoization.
//
// Three problems in the un-optimized version:
//   1. CourseRow was a plain component, so every row re-rendered whenever any
//      state in the page changed, even when that row's data was identical.
//   2. The per-row display values (credit label, colour fallback) were
//      recomputed on each render.
//   3. The list summary was recalculated from scratch on every render.
//
// React.memo makes a row re-render only when its own props actually change.
// useMemo caches the derived data so it is recomputed only when the course
// list itself changes. useCallback keeps the retry handler referentially
// stable so memoized children are not invalidated by a new function identity
// on each render.

const CourseRow = memo(function CourseRow({ course }) {
  const credits = course.creditHours ?? 3
  return (
    <li className="course">
      <svg
        className="course__swatch"
        viewBox="0 0 10 40"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="10" height="40" rx="5" fill={course.colour || '#c7c9d6'} />
      </svg>
      <div className="course__body">
        <div className="course__code">{course.code}</div>
        <div className="course__title">{course.title}</div>
      </div>
      <div className="course__meta">
        {course.instructorName && <span>{course.instructorName}</span>}
        {course.term && <span>{course.term}</span>}
        <span>
          {credits} credit{credits === 1 ? '' : 's'}
        </span>
      </div>
    </li>
  )
})

export default function Courses() {
  const { token } = useAuth()
  const [state, setState] = useState({ status: 'loading', courses: [], total: 0 })

  const load = useCallback(() => {
    let active = true
    setState((s) => ({ ...s, status: 'loading' }))
    listCourses(token, { page: 1, limit: 20 })
      .then((res) => {
        if (!active) return
        setState({ status: 'ready', courses: res.data || [], total: res.total || 0 })
      })
      .catch((err) => {
        if (!active) return
        setState({ status: 'error', courses: [], total: 0, error: err.message })
      })
    return () => {
      active = false
    }
  }, [token])

  useEffect(() => load(), [load])

  // Derived summary, recomputed only when the course list changes.
  const summary = useMemo(() => {
    const totalCredits = state.courses.reduce((sum, c) => sum + (c.creditHours ?? 3), 0)
    const terms = new Set(state.courses.map((c) => c.term).filter(Boolean))
    return { totalCredits, termCount: terms.size }
  }, [state.courses])

  // Stable row list; rebuilt only when the courses themselves change.
  const rows = useMemo(
    () => state.courses.map((c) => <CourseRow key={c._id} course={c} />),
    [state.courses]
  )

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1 className="panel__title">Courses</h1>
        </div>
        <Link className="btn btn--primary" to="/courses/new">
          New course
        </Link>
      </div>

      {state.status === 'loading' && <p className="notice">Loading courses…</p>}

      {state.status === 'error' && <p className="notice notice--error">{state.error}</p>}

      {state.status === 'ready' && state.courses.length === 0 && (
        <div className="empty">
          <p>No courses yet.</p>
          <Link className="btn btn--primary" to="/courses/new">
            Add your first course
          </Link>
        </div>
      )}

      {state.status === 'ready' && state.courses.length > 0 && (
        <>
          <p className="panel__count">
            Showing {state.courses.length} of {state.total} · {summary.totalCredits} credits
            {summary.termCount > 0 && ` · ${summary.termCount} term${summary.termCount === 1 ? '' : 's'}`}
          </p>
          <ul className="course-list">{rows}</ul>
        </>
      )}
    </section>
  )
}
