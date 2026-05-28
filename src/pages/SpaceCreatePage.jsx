import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse',      label: '배우자' },
  { value: 'parent',      label: '부모님' },
  { value: 'child',       label: '자녀' },
  { value: 'sibling',     label: '형제 / 자매' },
  { value: 'grandparent', label: '조부모님' },
  { value: 'friend',      label: '친구 / 지인' },
  { value: 'self',        label: '본인 (사전 기록)' },
  { value: 'other',       label: '기타' },
]

const STEPS = [
  { num: 1, label: '기본 정보' },
  { num: 2, label: '이야기 기록' },
]

export default function SpaceCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', relationship: '', birth_year: '', death_year: '', bio: '', life_story: '',
  })

  const currentYear = new Date().getFullYear()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = () => {
    setError('')
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
    if (!form.relationship)  { setError('관계를 선택해주세요.'); return }
    setStep(2)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.bio.trim()) { setError('한 줄 소개를 입력해주세요.'); return }
    setLoading(true)

    const { data, error: dbError } = await supabase
      .from('spaces')
      .insert([{
        owner_id:   user.id,
        name:       form.name.trim(),
        relationship: form.relationship,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        bio:        form.bio.trim(),
        life_story: form.life_story.trim(),
        is_self:    form.relationship === 'self',
        status:     'draft',
      }])
      .select()
      .single()

    setLoading(false)

    if (dbError) {
      console.error('DB Error:', dbError)
      setError(`저장 오류: ${dbError.message}`)
      return
    }

    navigate(`/space/${data.id}`)
  }

  /* ── 공통 인풋 스타일 ── */
  const inputStyle = {
    width: '100%', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '14px 18px',
    fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.9)',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
    appearance: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'rgba(255,255,255,0.85)' }}>

      {/* 배경 글로우 */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(242,212,155,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* 헤더 */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', height: '64px',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" id="create-back" style={{
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s',
            fontFamily: 'Pretendard, sans-serif', fontSize: '14px',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            대시보드
          </Link>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#fff' }}>
            새 추모 공간
          </span>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* 본문 */}
      <main style={{ paddingTop: '96px', paddingBottom: '80px', padding: '96px 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* 스텝 인디케이터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Pretendard, sans-serif', fontSize: '13px', fontWeight: 700,
                  transition: 'all 0.3s',
                  background: step >= s.num ? '#F2D49B' : 'rgba(255,255,255,0.08)',
                  color: step >= s.num ? '#080808' : 'rgba(255,255,255,0.3)',
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{
                  fontFamily: 'Pretendard, sans-serif', fontSize: '13px', fontWeight: 600,
                  color: step >= s.num ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.3s',
                }}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: '40px', height: '1px', margin: '0 4px',
                    background: step > s.num ? '#F2D49B' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* 오류 */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '14px 18px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgb(252,165,165)', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* ── STEP 1: 기본 정보 ── */}
          {step === 1 && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>
                기본 정보
              </h2>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
                소중한 분에 대한 기본 정보를 입력해주세요.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 이름 */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    이름 <span style={{ color: '#F2D49B' }}>*</span>
                  </label>
                  <input id="create-name" name="name" type="text" placeholder="홍길동"
                    value={form.name} onChange={handleChange} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* 관계 */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    관계 <span style={{ color: '#F2D49B' }}>*</span>
                  </label>
                  <select id="create-relationship" name="relationship" value={form.relationship} onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer', color: form.relationship ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <option value="" style={{ color: '#888' }}>관계를 선택해주세요</option>
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} style={{ background: '#1A1A1A', color: '#fff' }}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 연도 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      출생 연도
                    </label>
                    <input id="create-birth-year" name="birth_year" type="number"
                      placeholder="1940" min="1900" max={currentYear}
                      value={form.birth_year} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      별세 연도
                    </label>
                    <input id="create-death-year" name="death_year" type="number"
                      placeholder={String(currentYear)} min="1900" max={currentYear}
                      value={form.death_year} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '-8px' }}>
                  본인 사전 기록인 경우 별세 연도는 비워두세요.
                </p>
              </div>

              <button id="create-next" onClick={handleNext} className="btn-primary"
                style={{ width: '100%', marginTop: '32px', height: '52px' }}>
                다음 단계 →
              </button>
            </div>
          )}

          {/* ── STEP 2: 이야기 기록 ── */}
          {step === 2 && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>
                이야기 기록
              </h2>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
                <span style={{ color: '#F2D49B' }}>{form.name}</span>님에 대해 기록해주세요. 나중에 언제든지 수정할 수 있습니다.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 한 줄 소개 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                      color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      한 줄 소개 <span style={{ color: '#F2D49B' }}>*</span>
                    </label>
                    <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                      {form.bio.length}/100
                    </span>
                  </div>
                  <input id="create-bio" name="bio" type="text"
                    placeholder="예: 평생 가족을 위해 헌신하셨던 따뜻한 분"
                    value={form.bio} onChange={handleChange} maxLength={100} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* 인생 이야기 */}
                <div>
                  <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    인생 이야기{' '}
                    <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(선택)</span>
                  </label>
                  <textarea id="create-life-story" name="life_story" rows={9}
                    placeholder={`${form.name}님의 삶의 이야기를 자유롭게 기록해주세요.\n\n어린 시절, 직업, 좋아하셨던 것들, 가족에게 전하고 싶은 이야기 등 무엇이든 괜찮습니다.`}
                    value={form.life_story} onChange={handleChange}
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.8 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button id="create-prev" onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, height: '52px' }}>
                  ← 이전
                </button>
                <button id="create-submit" onClick={handleSubmit} disabled={loading} className="btn-primary"
                  style={{ flex: 2, height: '52px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #080808', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      저장 중...
                    </span>
                  ) : '추모 공간 만들기 ✦'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); } select option { background: #1A1A1A; }`}</style>
    </div>
  )
}
