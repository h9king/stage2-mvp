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

  useEffect(() => { fetchSpaces() }, [user])

  const fetchSpaces = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('spaces').select('*')
      .eq('owner_id', user.id).order('created_at', { ascending: false })
    if (!error) setSpaces(data || [])
    setLoading(false)
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'rgba(255,255,255,0.85)' }}>

      {/* 헤더 */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', height: '64px',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F2D49B',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '14px', color: '#080808' }}>S2</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#fff' }}>STAGE2</span>
          </Link>

          {/* 사용자 메뉴 */}
          <div style={{ position: 'relative' }}>
            <button id="dashboard-menu" onClick={() => setMenuOpen(!menuOpen)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(242,212,155,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '13px', color: '#F2D49B' }}>
                  {userName[0]?.toUpperCase()}
                </span>
              </div>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                {userName}
              </span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '48px',
                background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '8px', minWidth: '160px', zIndex: 50,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              }}>
                <button id="dashboard-signout" onClick={handleSignOut} style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none',
                  background: 'transparent', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.6)',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#fff' }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main style={{ paddingTop: '96px', paddingBottom: '80px', padding: '96px 24px 80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* 환영 */}
          <div style={{ marginBottom: '48px', paddingTop: '24px' }}>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: '#F2D49B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              ✦ 나의 추모 공간
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              안녕하세요, {userName}님
            </h1>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.45)' }}>
              소중한 분의 이야기를 기록하고 보존하세요.
            </p>
          </div>

          {/* 새 공간 만들기 */}
          <div style={{ marginBottom: '48px' }}>
            <Link to="/space/create" id="dashboard-create" className="btn-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 추모 공간 만들기
            </Link>
          </div>

          {/* 목록 */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(242,212,155,0.2)', borderTopColor: '#F2D49B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : spaces.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 40px',
              background: '#111', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>🕊️</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#fff', marginBottom: '12px' }}>
                아직 추모 공간이 없습니다
              </h2>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
                소중한 분의 인생 이야기를 지금 시작해보세요.
              </p>
              <Link to="/space/create" id="dashboard-empty-create" className="btn-primary">
                첫 번째 공간 만들기
              </Link>
            </div>
          ) : (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff', marginBottom: '24px' }}>
                나의 추모 공간 ({spaces.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {spaces.map(space => (
                  <Link key={space.id} to={`/space/${space.id}`} id={`space-${space.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                    className="card-dark" >
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(242,212,155,0.1)', border: '1px solid rgba(242,212,155,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        }}>
                          {space.profile_image_url
                            ? <img src={space.profile_image_url} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#F2D49B' }}>{space.name?.[0]}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', fontWeight: 600 }}>{space.name}</div>
                          {space.birth_year && <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                            {space.birth_year}{space.death_year ? ` — ${space.death_year}` : ''}
                          </div>}
                        </div>
                      </div>
                      {space.bio && <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '16px' }}>{space.bio}</p>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(space.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: '#F2D49B', fontWeight: 600 }}>보기 →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
