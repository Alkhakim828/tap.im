import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, decodeToken, saveToken, removeToken } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const saved = localStorage.getItem('tapim_user')
    if (token && saved) {
      const decoded = decodeToken(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(JSON.parse(saved))
      } else {
        removeToken()
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await authAPI.login({ email, password })
    // ✅ Role comes directly from response body
    const token = data.access_token
    const role = data.role || 'applicant' // 'applicant' | 'recruiter'

    saveToken(token)
    const decoded = decodeToken(token)
    const userId = decoded.userId

    const savedName = localStorage.getItem('pending_name') || ''
    const savedEmail = localStorage.getItem('pending_email') || email
    const savedCompany = localStorage.getItem('pending_company') || ''

    const userData = { userId, role, email: savedEmail, name: savedName, company: savedCompany }
    setUser(userData)
    localStorage.setItem('tapim_user', JSON.stringify(userData))

    localStorage.removeItem('pending_role')
    localStorage.removeItem('pending_name')
    localStorage.removeItem('pending_email')
    localStorage.removeItem('pending_company')

    return userData
  }

  function setRole(role) { localStorage.setItem('pending_role', role) }
  function setRegName(name) { localStorage.setItem('pending_name', name) }
  function setRegCompany(company) { localStorage.setItem('pending_company', company) }

  function logout() {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setRole, setRegName, setRegCompany }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
