import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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

export default function SpaceEditPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notAllowed, setNotAllowed] = useState(false)

  const [form, setForm] = useState({
    name: '', relationship: '', birth_year: '', death_year: '',
    bio: '', life_story: '',
  })

  const currentYear = new Date().getFullYear()

  useEffect(() => { fetchSpace() }, [id])

  const fetchSpace = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('spaces').select('*').eq('id', id).single()

    if (error || !data) { setNotAllowed(true); setLoading(false); return }
    if (data.owner_id !== user?.id) { setNotAllowed(true); setLoading(false); return }

    setForm({
      name:         data.name || '',
      relationship: data.relationship || '',
      birth_year:   data.birth_year ? String(data.birth_year) : '',
      death_year:   data.death_year ? String(data.death_year) : '',
      bio:          data.bio || '',
      life_story:   data.life_story || '',
    })
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess('')
  }

  const handleSave = async () => {
    setError('')
    if (!form.name.trim())     { setError('이름을 입력해주세요.'); return }
    if (!form.relationship)    { setError('관계를 선택해주세요.'); return }
    if (!form.bio.trim())      { setError('한 줄 소개를 입력해주세요.'); return }

    setSaving(true)
    const { error: dbError } = await supabase
      .from('spaces')
      .update({
        name:         form.name.trim(),
        relationship: form.relationship,
        birth_year:   form.birth_year ? parseInt(form.birth_year) : null,
        death_year:   form.death_year ? parseInt(form.death_year) : null,
        bio:          form.bio.trim(),
        life_story:   form.life_story.trim(),
        is_self:      form.relationship === 'self',
      })
      .eq('id', id)
      .eq('owner_id', user.id)

    setSaving(false)

    if (dbError) {
      setError(`저장 오류: ${dbError.message}`)
      return
    }

    setSuccess('저장되었습니다.')
    setTimeout(() => navigate(`/space/${id}`), 1200)
  }

  const handleDelete = async () => {
    if (!window.confirm(`"${form.name}" 추모 공간을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return

    const { error: dbError } = await supabase
      .from('spaces').delete().eq('id', id).eq('owner_id', user.id)

    if (dbError) { setError(`삭제 오류: ${dbError.message}`); return }

    navigate('/dashboard')
  }

  const inputStyle = {
    width: '100%', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '14px 18px',
    fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.9)',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', appearance: 'none',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(242,212,155,0.2)', borderTopColor: '#F2D49B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (notAllowed) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🚫</div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff' }}>접근 권한이 없습니다</p>
      <Link to="/dashboard" className="btn-primary">대시보드로</Link>
    </div>
  )

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
          <Link to={`/space/${id}`} id="edit-back" style={{
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)', fontFamily: 'Pretendard, sans-serif', fontSize: '14px',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            취소
          </Link>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#fff' }}>
            공간 편집
          </span>
          <button id="edit-save" onClick={handleSave} disabled={saving} className="btn-primary"
            style={{ height: '36px', fontSize: '13px', padding: '0 20px' }}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      {/* 본문 */}
      <main style={{ paddingTop: '96px', paddingBottom: '80px', padding: '96px 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* 성공 */}
          {success && (
            <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgb(74,222,128)', margin: 0 }}>✓ {success}</p>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgb(252,165,165)', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* 기본 정보 카드 */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>
              기본 정보
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  이름 <span style={{ color: '#F2D49B' }}>*</span>
                </label>
                <input id="edit-name" name="name" type="text" value={form.name} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  관계 <span style={{ color: '#F2D49B' }}>*</span>
                </label>
                <select id="edit-relationship" name="relationship" value={form.relationship} onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <option value="">관계를 선택해주세요</option>
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: '#1A1A1A' }}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>출생 연도</label>
                  <input id="edit-birth-year" name="birth_year" type="number" placeholder="1940"
                    min="1900" max={currentYear} value={form.birth_year} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>별세 연도</label>
                  <input id="edit-death-year" name="death_year" type="number" placeholder={String(currentYear)}
                    min="1900" max={currentYear} value={form.death_year} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 이야기 카드 */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>
              이야기 기록
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    한 줄 소개 <span style={{ color: '#F2D49B' }}>*</span>
                  </label>
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>{form.bio.length}/100</span>
                </div>
                <input id="edit-bio" name="bio" type="text" maxLength={100} value={form.bio} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  인생 이야기 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.25)' }}>(선택)</span>
                </label>
                <textarea id="edit-life-story" name="life_story" rows={12} value={form.life_story} onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8, minHeight: '200px' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(242,212,155,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <button id="edit-save-bottom" onClick={handleSave} disabled={saving} className="btn-primary"
              style={{ width: '100%', marginTop: '24px', height: '52px' }}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #080808', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  저장 중...
                </span>
              ) : '변경사항 저장'}
            </button>
          </div>

          {/* 위험 영역 */}
          <div style={{ background: '#111', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 700, color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              위험 영역
            </h3>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
              공간을 삭제하면 모든 이야기, 사진, 음성이 영구적으로 사라집니다.
            </p>
            <button id="edit-delete" onClick={handleDelete} style={{
              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              padding: '10px 20px', color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
              fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.08)'; e.target.style.color = 'rgb(239,68,68)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(239,68,68,0.7)' }}
            >
              이 공간 삭제하기
            </button>
          </div>

        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); } select option { background: #1A1A1A; }`}</style>
    </div>
  )
}
