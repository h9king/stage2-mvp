import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import SpaceCreatePage from './pages/SpaceCreatePage'
import SpaceViewPage from './pages/SpaceViewPage'
import SpaceEditPage from './pages/SpaceEditPage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 퍼블릭 */}
          <Route path="/" element={<LandingPage />} />

          {/* 비로그인 전용 */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* 로그인 필수 */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/space/create"
            element={
              <PrivateRoute>
                <SpaceCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/space/:id"
            element={
              <PrivateRoute>
                <SpaceViewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/space/:id/edit"
            element={
              <PrivateRoute>
                <SpaceEditPage />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
                <div className="text-5xl mb-4">🌸</div>
                <h1 className="font-display text-2xl text-brand-brown mb-2">페이지를 찾을 수 없습니다</h1>
                <a href="/" className="btn-primary mt-4 inline-block">홈으로 돌아가기</a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
