import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin } from './api.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'studyflow.auth'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStored)

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    else localStorage.removeItem(STORAGE_KEY)
  }, [auth])

  async function signIn(email, password) {
    const data = await apiLogin(email, password)
    setAuth({ token: data.token, user: data.user })
    return data.user
  }

  function signOut() {
    setAuth(null)
  }

  const value = {
    token: auth?.token || null,
    user: auth?.user || null,
    isAuthenticated: Boolean(auth?.token),
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
