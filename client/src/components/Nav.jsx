import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Nav() {
  const { isAuthenticated, user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <header className="nav">
      <div className="nav__brand">
        <span className="nav__mark" aria-hidden="true" />
        StudyFlow
      </div>
      <nav className="nav__links">
        <NavLink to="/courses" className="nav__link">
          Courses
        </NavLink>
        <NavLink to="/courses/new" className="nav__link">
          New course
        </NavLink>
        <NavLink to="/analytics" className="nav__link">
          Analytics
        </NavLink>
      </nav>
      <div className="nav__account">
        <span className="nav__user">{user?.fullName || user?.email}</span>
        <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  )
}
