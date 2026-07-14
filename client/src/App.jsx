import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Courses from './pages/Courses.jsx'
import CreateCourse from './pages/CreateCourse.jsx'

// BASELINE NOTE (Assignment 3):
// Analytics pulls in the recharts library and is imported eagerly here, so it
// ships inside the main bundle even for users who never open it. This is the
// un-optimized baseline. Client-side optimization #1 (step 3) converts this to
// a lazy-loaded route so recharts is code-split into its own chunk.
import Analytics from './pages/Analytics.jsx'

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
                <Analytics />
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
