import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VacanciesPage from './pages/VacanciesPage'
import VacancyDetailPage from './pages/VacancyDetailPage'
import CandidateProfileViewPage from './pages/CandidateProfileViewPage'
import GuidePage from './pages/GuidePage'
import ProfilePage from './pages/ProfilePage'
import CandidateChatPage from './pages/candidate/CandidateChatPage'
import EmployerProfilePage from './pages/employer/EmployerProfilePage'
import CandidatesPage from './pages/employer/CandidatesPage'
import ChatPage from './pages/employer/ChatPage'

// Redirects logged-in users to correct dashboard by role
function RoleRedirect({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return children // not logged in, show page normally
  return children
}

// Protects route — redirects to correct page if wrong role
function Guard({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role === 'applicant' && user.role === 'recruiter') return <Navigate to="/employer/profile" replace />
  if (role === 'recruiter' && user.role !== 'recruiter') return <Navigate to="/vacancies" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate only */}
      <Route path="/vacancies"        element={<Guard role="applicant"><VacanciesPage /></Guard>} />
      <Route path="/vacancies/:id"    element={<Guard role="applicant"><VacancyDetailPage /></Guard>} />
      <Route path="/chat"             element={<Guard role="applicant"><CandidateChatPage /></Guard>} />
      <Route path="/guide"            element={<Guard role="applicant"><GuidePage /></Guard>} />
      <Route path="/profile"          element={<Guard role="applicant"><ProfilePage /></Guard>} />

      {/* Employer only */}
      <Route path="/employer/profile"              element={<Guard role="recruiter"><EmployerProfilePage /></Guard>} />
      <Route path="/employer/candidates"           element={<Guard role="recruiter"><CandidatesPage /></Guard>} />
      <Route path="/employer/candidates/:userId"   element={<Guard role="recruiter"><CandidateProfileViewPage /></Guard>} />
      <Route path="/employer/vacancies/:id"        element={<Guard role="recruiter"><VacancyDetailPage /></Guard>} />
      <Route path="/employer/chat"                 element={<Guard role="recruiter"><ChatPage /></Guard>} />
      <Route path="/employer/guide"                element={<Guard role="recruiter"><GuidePage /></Guard>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
