import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setError('')
    setSuccessMsg('')
    setForm({ name: '', email: '', password: '' })
  }, [tab])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        if (!form.name.trim()) throw new Error('이름을 입력해주세요.')
        if (form.password.length < 8) throw new Error('비밀번호는 8자 이상이어야 합니다.')
        const { error } = await signUp(form.email, form.password, form.name)
        if (error) throw error
        setSuccessMsg('가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.')
      }
    } catch (err) {
      const messages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'User already registered': '이미 가입된 이메일입니다.',
        'Email not confirmed': '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.',
      }
      setError(messages[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column' }}>

      {/* 배경 글로우 */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(242,212,155,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* 헤더 */}
      <header style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
        <Link to="/" id="auth-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', background: '#F2D49B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '14px', color: '#080808' }}>S2</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#fff' }}>STAGE2</span>
        </Link>
      </header>

      {/* 메인 */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* 제목 */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {tab === 'signin' ? '다시 만나서 반갑습니다' : 'STAGE2와 함께하세요'}
            </h1>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>
              {tab === 'signin' ? '소중한 공간이 기다리고 있습니다' : '소중한 분의 이야기를 영원히 기록하세요'}
            </p>
          </div>

          {/* 카드 */}
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px',
          }}>
            {/* 탭 */}
            <div style={{
              display: 'flex', background: '#1A1A1A', borderRadius: '12px', padding: '4px', marginBottom: '28px',
            }}>
              {['signin', 'signup'].map(t => (
                <button
                  key={t}
                  id={`auth-tab-${t}`}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600,
                    transition: 'all 0.2s',
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? '#080808' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {t === 'signin' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            {/* 성공 메시지 */}
            {successMsg && (
              <div style={{
                marginBottom: '20px', padding: '16px', borderRadius: '12px',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              }}>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgb(74,222,128)' }}>{successMsg}</p>
              </div>
            )}

            {/* 오류 */}
            {error && (
              <div style={{
                marginBottom: '20px', padding: '16px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgb(252,165,165)' }}>{error}</p>
              </div>
            )}

            {/* 폼 */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tab === 'signup' && (
                <div>
                  <label htmlFor="auth-name" className="label">이름</label>
                  <input id="auth-name" name="name" type="text" required
                    placeholder="홍길동" value={form.name} onChange={handleChange} className="input-dark" />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="label">이메일</label>
                <input id="auth-email" name="email" type="email" required
                  placeholder="example@email.com" value={form.email} onChange={handleChange} className="input-dark" />
              </div>
              <div>
                <label htmlFor="auth-password" className="label">비밀번호</label>
                <input id="auth-password" name="password" type="password" required
                  placeholder={tab === 'signup' ? '8자 이상 입력' : '비밀번호를 입력해주세요'}
                  value={form.password} onChange={handleChange} className="input-dark" />
              </div>

              <button id="auth-submit" type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', marginTop: '8px', height: '52px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #080808', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    처리 중...
                  </span>
                ) : (
                  tab === 'signin' ? '로그인' : '가입하기'
                )}
              </button>
            </form>

            {tab === 'signin' && (
              <p style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
                처음이세요?{' '}
                <button id="auth-switch-signup" onClick={() => setTab('signup')}
                  style={{ background: 'none', border: 'none', color: '#F2D49B', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  회원가입하기
                </button>
              </p>
            )}
          </div>

          {tab === 'signup' && (
            <p style={{ marginTop: '16px', textAlign: 'center', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', padding: '0 8px' }}>
              가입 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
