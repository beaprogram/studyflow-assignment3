import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { listCourses } from '../api.js'

// BASELINE NOTE (Assignment 3):
// The list below maps over every course and re-renders each row on any state
// change, and the per-course credit-hour math is recomputed on each render.
// This is the un-optimized baseline. Client-side optimization #2 (step 3)
// memoizes the derived data (useMemo) and the row component (React.memo) so
// unrelated re-renders stop re-doing this work.

function CourseRow({ course }) {
  return (
    <li className="course">
      <span
        className="course__swatch"
        style={{ background: course.colour || '#c7c9d6' }}
        aria-hidden="true"
      />
      <div className="course__body">
        <div className="course__code">{course.code}</div>
        <div className="course__title">{course.title}</div>
      </div>
      <div className="course__meta">
        {course.instructorName && <span>{course.instructorName}</span>}
        {course.term && <span>{course.term}</span>}
        <span>
          {course.creditHours ?? 3} credit
          {(course.creditHours ?? 3) === 1 ? '' : 's'}
        </span>
      </div>
    </li>
  )
}

export default function Courses() {
  const { token } = useAuth()
  const [state, setState] = useState({ status: 'loading', courses: [], total: 0 })

  useEffect(() => {
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

      {state.status === 'loading' && (
        <p className="notice">Loading courses… (first load may wake the server)</p>
      )}

      {state.status === 'error' && (
        <p className="notice notice--error">{state.error}</p>
      )}

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
          <p className="panel__count">{state.total} total</p>
          <ul className="course-list">
            {state.courses.map((c) => (
              <CourseRow key={c._id} course={c} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
