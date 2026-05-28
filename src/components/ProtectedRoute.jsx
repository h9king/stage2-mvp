import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 로그인 필요 페이지 보호
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-brown/60 font-sans text-sm">잠시만요...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}

// 이미 로그인된 경우 대시보드로 리다이렉트
export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return !user ? children : <Navigate to="/dashboard" replace />
}
