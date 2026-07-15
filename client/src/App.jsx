import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Courses from './pages/Courses.jsx'
import CreateCourse from './pages/CreateCourse.jsx'

// CLIENT-SIDE OPTIMIZATION 1: route-level code splitting.
//
// Analytics pulls in the recharts charting library, which is by far the
// heaviest dependency in the app. It used to be imported eagerly, so recharts
// shipped inside the main bundle and every visitor downloaded and parsed it on
// first load, even though most users never open the Analytics page.
//
// React.lazy + a dynamic import() tells Vite to emit recharts and this page as
// a separate chunk. The main bundle shrinks, first render happens sooner, and
// the chart code is fetched only when the user actually navigates to /analytics.
const Analytics = lazy(() => import('./pages/Analytics.jsx'))

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="app__main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                {/* Suspense shows a fallback while the lazy chunk downloads. */}
                <Suspense fallback={<p className="notice">Loading analytics…</p>}>
                  <Analytics />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="*" element={<Navigate to="/courses" replace />} />
        </Routes>
      </main>
    </div>
  )
}
