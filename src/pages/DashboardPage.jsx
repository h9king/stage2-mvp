import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchSpaces()
  }, [user])

  const fetchSpaces = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setSpaces(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-cream">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" id="dashboard-logo">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S2</span>
            </div>
            <span className="font-display font-semibold text-brand-brown text-lg">STAGE2</span>
          </Link>

          {/* 사용자 메뉴 */}
          <div className="relative">
            <button
              id="dashboard-user-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-cream transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-sans font-bold text-primary text-sm">
                  {userName[0]?.toUpperCase()}
                </span>
              </div>
              <span className="font-sans text-sm font-semibold text-brand-brown hidden sm:block">
                {userName}
              </span>
              <svg className={`w-4 h-4 text-brand-brown/50 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-card-hover border border-brand-cream py-2 w-48 z-50">
                <button
                  id="dashboard-signout"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 font-sans text-sm text-brand-brown/70 hover:bg-brand-cream hover:text-brand-brown transition-colors duration-150"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* 환영 메시지 */}
          <div className="mb-10">
            <h1 className="font-display text-3xl text-brand-brown mb-1">
              안녕하세요, {userName}님
            </h1>
            <p className="font-sans text-sm text-brand-brown/60">
              소중한 분의 이야기를 기록하고 보존하세요.
            </p>
          </div>

          {/* 새 공간 만들기 버튼 */}
          <div className="mb-8">
            <Link
              to="/space/create"
              id="dashboard-create-space"
              className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 추모 공간 만들기
            </Link>
          </div>

          {/* SPACE 목록 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : spaces.length === 0 ? (
            /* 비어있을 때 */
            <div className="text-center py-20 bg-brand-cream/30 rounded-2xl border-2 border-dashed border-brand-cream">
              <div className="text-5xl mb-4">🕊️</div>
              <h2 className="font-display text-xl text-brand-brown mb-2">
                아직 추모 공간이 없습니다
              </h2>
              <p className="font-sans text-sm text-brand-brown/60 mb-6">
                소중한 분의 인생 이야기를 지금 시작해보세요.
              </p>
              <Link
                to="/space/create"
                id="dashboard-empty-create"
                className="btn-primary inline-block text-sm"
              >
                첫 번째 공간 만들기
              </Link>
            </div>
          ) : (
            /* 공간 목록 */
            <div>
              <h2 className="font-display text-xl text-brand-brown mb-5">나의 추모 공간</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {spaces.map((space) => (
                  <Link
                    key={space.id}
                    to={`/space/${space.id}`}
                    id={`space-card-${space.id}`}
                    className="card hover:shadow-card-hover transition-all duration-300 group block"
                  >
                    {/* 커버 이미지 영역 */}
                    <div className="h-36 bg-gradient-to-br from-primary/20 to-brand-green/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {space.cover_image_url ? (
                        <img
                          src={space.cover_image_url}
                          alt={space.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🌸</span>
                      )}
                    </div>
                    <h3 className="font-display text-lg text-brand-brown mb-1 group-hover:text-primary transition-colors duration-200">
                      {space.name}
                    </h3>
                    {space.birth_year && space.death_year && (
                      <p className="font-sans text-xs text-brand-brown/50">
                        {space.birth_year} — {space.death_year}
                      </p>
                    )}
                    {space.bio && (
                      <p className="font-sans text-sm text-brand-brown/70 mt-2 line-clamp-2">
                        {space.bio}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-brand-cream flex items-center justify-between">
                      <span className="font-sans text-xs text-brand-brown/40">
                        {new Date(space.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="font-sans text-xs text-primary font-semibold group-hover:underline">
                        보기 →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
