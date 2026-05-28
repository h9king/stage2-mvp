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
        if (!form.name.trim()) { throw new Error('이름을 입력해주세요.') }
        if (form.password.length < 8) { throw new Error('비밀번호는 8자 이상이어야 합니다.') }
        const { error } = await signUp(form.email, form.password, form.name)
        if (error) throw error
        setSuccessMsg('가입 완료! 이메일을 확인하여 인증을 완료해주세요.')
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* 상단 로고 */}
      <header className="p-6">
        <Link to="/" id="auth-logo" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">S2</span>
          </div>
          <span className="font-display font-semibold text-brand-brown text-lg">STAGE2</span>
        </Link>
      </header>

      {/* 폼 영역 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* 카드 */}
          <div className="card">
            {/* 탭 */}
            <div className="flex bg-brand-cream rounded-xl p-1 mb-8">
              <button
                id="auth-tab-signin"
                onClick={() => setTab('signin')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all duration-200 ${
                  tab === 'signin'
                    ? 'bg-white text-brand-brown shadow-sm'
                    : 'text-brand-brown/50 hover:text-brand-brown/70'
                }`}
              >
                로그인
              </button>
              <button
                id="auth-tab-signup"
                onClick={() => setTab('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all duration-200 ${
                  tab === 'signup'
                    ? 'bg-white text-brand-brown shadow-sm'
                    : 'text-brand-brown/50 hover:text-brand-brown/70'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* 제목 */}
            <div className="mb-6">
              <h1 className="font-display text-2xl text-brand-brown mb-1">
                {tab === 'signin' ? '다시 만나서 반갑습니다' : 'STAGE2와 함께하세요'}
              </h1>
              <p className="font-sans text-xs text-brand-brown/50">
                {tab === 'signin'
                  ? '소중한 공간이 기다리고 있습니다'
                  : '소중한 분의 이야기를 영원히 기록하세요'}
              </p>
            </div>

            {/* 성공 메시지 */}
            {successMsg && (
              <div className="mb-4 p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl">
                <p className="font-sans text-sm text-brand-green font-semibold">{successMsg}</p>
              </div>
            )}

            {/* 오류 메시지 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="font-sans text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label htmlFor="auth-name" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                    이름
                  </label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    required
                    placeholder="홍길동"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                               focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-brand-brown/30"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                  이메일
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                             focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-brand-brown/30"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                  비밀번호
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  required
                  placeholder={tab === 'signup' ? '8자 이상 입력해주세요' : '비밀번호를 입력해주세요'}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                             focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-brand-brown/30"
                />
              </div>

              <button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>처리 중...</span>
                  </>
                ) : (
                  tab === 'signin' ? '로그인' : '회원가입'
                )}
              </button>
            </form>

            {/* 구분선 */}
            {tab === 'signin' && (
              <p className="mt-6 text-center font-sans text-xs text-brand-brown/50">
                처음이세요?{' '}
                <button
                  id="auth-switch-to-signup"
                  onClick={() => setTab('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  회원가입하기
                </button>
              </p>
            )}
          </div>

          {/* 개인정보 동의 안내 */}
          {tab === 'signup' && (
            <p className="mt-4 text-center font-sans text-xs text-brand-brown/40 px-4">
              가입 시 STAGE2의 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
