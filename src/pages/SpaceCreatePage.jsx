import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: '배우자' },
  { value: 'parent', label: '부모님' },
  { value: 'child', label: '자녀' },
  { value: 'sibling', label: '형제/자매' },
  { value: 'grandparent', label: '조부모님' },
  { value: 'friend', label: '친구/지인' },
  { value: 'self', label: '본인 (사전 기록)' },
  { value: 'other', label: '기타' },
]

export default function SpaceCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: 기본정보, 2: 이야기, 3: 완료
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    relationship: '',
    birth_year: '',
    death_year: '',
    bio: '',
    life_story: '',
    is_self: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
      if (!form.relationship) { setError('관계를 선택해주세요.'); return }
    }
    setStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.bio.trim()) { setError('한 줄 소개를 입력해주세요.'); return }
    setLoading(true)

    const { data, error: dbError } = await supabase
      .from('spaces')
      .insert([{
        owner_id: user.id,
        name: form.name.trim(),
        relationship: form.relationship,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        bio: form.bio.trim(),
        life_story: form.life_story.trim(),
        is_self: form.relationship === 'self',
        status: 'draft',
      }])
      .select()
      .single()

    setLoading(false)

    if (dbError) {
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
      console.error(dbError)
      return
    }

    // 성공 → 공간 보기 페이지로 이동
    navigate(`/space/${data.id}`)
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-cream">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" id="create-back" className="flex items-center gap-2 text-brand-brown/60 hover:text-brand-brown transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-sans text-sm">대시보드로</span>
          </Link>
          <span className="font-display text-base text-brand-brown">새 추모 공간 만들기</span>
          <div className="w-16" /> {/* 균형 맞추기 */}
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-sm font-bold transition-all duration-300
                  ${step > s ? 'bg-primary text-white' : step === s ? 'bg-primary text-white' : 'bg-brand-cream text-brand-brown/40'}`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`font-sans text-xs font-semibold transition-colors duration-300
                  ${step >= s ? 'text-brand-brown' : 'text-brand-brown/30'}`}>
                  {s === 1 ? '기본 정보' : '이야기 기록'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 w-8 rounded transition-colors duration-300 ${step > s ? 'bg-primary' : 'bg-brand-cream'}`} />}
              </div>
            ))}
          </div>

          {/* 오류 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* STEP 1: 기본 정보 */}
          {step === 1 && (
            <div className="card">
              <h2 className="font-display text-xl text-brand-brown mb-6">기본 정보</h2>

              <div className="space-y-5">
                {/* 이름 */}
                <div>
                  <label htmlFor="create-name" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                    이름 <span className="text-primary">*</span>
                  </label>
                  <input
                    id="create-name"
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                               focus:outline-none focus:border-primary transition-colors placeholder:text-brand-brown/30"
                  />
                </div>

                {/* 관계 */}
                <div>
                  <label htmlFor="create-relationship" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                    관계 <span className="text-primary">*</span>
                  </label>
                  <select
                    id="create-relationship"
                    name="relationship"
                    value={form.relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                               focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">관계를 선택해주세요</option>
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 생년 / 사망년 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-birth-year" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                      출생 연도
                    </label>
                    <input
                      id="create-birth-year"
                      name="birth_year"
                      type="number"
                      placeholder={`예: 1945`}
                      min="1900"
                      max={currentYear}
                      value={form.birth_year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                                 focus:outline-none focus:border-primary transition-colors placeholder:text-brand-brown/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="create-death-year" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                      별세 연도
                    </label>
                    <input
                      id="create-death-year"
                      name="death_year"
                      type="number"
                      placeholder={`예: ${currentYear}`}
                      min="1900"
                      max={currentYear}
                      value={form.death_year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                                 focus:outline-none focus:border-primary transition-colors placeholder:text-brand-brown/30"
                    />
                  </div>
                </div>
                <p className="font-sans text-xs text-brand-brown/40 -mt-2">
                  본인 사전 기록인 경우 별세 연도는 비워두세요.
                </p>
              </div>

              <button
                id="create-next"
                onClick={handleNext}
                className="btn-primary w-full mt-8"
              >
                다음 단계 →
              </button>
            </div>
          )}

          {/* STEP 2: 이야기 기록 */}
          {step === 2 && (
            <div className="card">
              <h2 className="font-display text-xl text-brand-brown mb-2">이야기 기록</h2>
              <p className="font-sans text-sm text-brand-brown/60 mb-6">
                {form.name}님에 대해 기록해주세요. 나중에 언제든지 수정할 수 있습니다.
              </p>

              <div className="space-y-5">
                {/* 한 줄 소개 */}
                <div>
                  <label htmlFor="create-bio" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                    한 줄 소개 <span className="text-primary">*</span>
                  </label>
                  <input
                    id="create-bio"
                    name="bio"
                    type="text"
                    placeholder="예: 평생 가족을 위해 헌신하셨던 따뜻한 분"
                    value={form.bio}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                               focus:outline-none focus:border-primary transition-colors placeholder:text-brand-brown/30"
                  />
                  <p className="font-sans text-xs text-brand-brown/40 mt-1 text-right">{form.bio.length}/100</p>
                </div>

                {/* 인생 이야기 */}
                <div>
                  <label htmlFor="create-life-story" className="block font-sans text-sm font-semibold text-brand-brown mb-2">
                    인생 이야기
                    <span className="font-normal text-brand-brown/50 ml-1">(선택)</span>
                  </label>
                  <textarea
                    id="create-life-story"
                    name="life_story"
                    rows={8}
                    placeholder={`${form.name}님의 삶의 이야기를 자유롭게 기록해주세요.\n\n어린 시절, 직업, 좋아하셨던 것들, 가족에게 전하고 싶은 이야기 등 무엇이든 괜찮습니다.`}
                    value={form.life_story}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-brand-cream rounded-xl font-sans text-sm text-brand-brown bg-white
                               focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-brand-brown/30 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  id="create-prev"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  ← 이전
                </button>
                <button
                  id="create-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '추모 공간 만들기 ✦'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
