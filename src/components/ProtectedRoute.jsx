import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

// Redirects to correct dashboard based on role
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) return null

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Wrong role → redirect to correct dashboard
  if (requiredRole === 'applicant' && user.role === 'recruiter') {
    return <Navigate to="/employer/profile" replace />
  }
  if (requiredRole === 'recruiter' && user.role !== 'recruiter') {
    return <Navigate to="/vacancies" replace />
  }

  return children
}
