import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../auth.jsx'
import { listCourses } from '../api.js'

// BASELINE NOTE (Assignment 3):
// This page imports the recharts charting library. Because App.jsx imports it
// eagerly, recharts is bundled into the main chunk in the baseline build.
// The derived chart data below is also recomputed on every render (no useMemo).
// Both are addressed by the step-3 client-side optimizations.

const PALETTE = ['#4338ca', '#0d9488', '#f59e0b', '#e11d48', '#6366f1', '#059669']

export default function Analytics() {
  const { token } = useAuth()
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listCourses(token, { page: 1, limit: 100 })
      .then((res) => active && setCourses(res.data || []))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
  }, [token])

  if (error) return <p className="notice notice--error">{error}</p>
  if (!courses) return <p className="notice">Loading analytics…</p>

  // Derived, un-memoized in the baseline.
  const byTerm = Object.values(
    courses.reduce((acc, c) => {
      const key = c.term || 'Unassigned'
      acc[key] = acc[key] || { name: key, count: 0 }
      acc[key].count += 1
      return acc
    }, {}),
  )

  const creditsByCourse = courses.map((c) => ({
    name: c.code,
    credits: c.creditHours ?? 3,
  }))

  const totalCredits = creditsByCourse.reduce((sum, c) => sum + c.credits, 0)

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Workspace insight</p>
          <h1 className="panel__title">Analytics</h1>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat__value">{courses.length}</div>
          <div className="stat__label">Courses</div>
        </div>
        <div className="stat">
          <div className="stat__value">{totalCredits}</div>
          <div className="stat__label">Total credits</div>
        </div>
        <div className="stat">
          <div className="stat__value">{byTerm.length}</div>
          <div className="stat__label">Terms</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2 className="chart-card__title">Credit hours by course</h2>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={creditsByCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="credits" fill="#4338ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Courses by term</h2>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byTerm}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {byTerm.map((entry, i) => (
                    <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
