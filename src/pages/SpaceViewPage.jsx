import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const RELATIONSHIP_LABELS = {
  spouse: '배우자', parent: '부모님', child: '자녀',
  sibling: '형제/자매', grandparent: '조부모님',
  friend: '친구/지인', self: '본인 기록', other: '소중한 분',
}

export default function SpaceViewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('story') // story | memories | voice

  useEffect(() => {
    fetchSpace()
  }, [id])

  const fetchSpace = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setSpace(data)
    }
    setLoading(false)
  }

  const isOwner = user && space && user.id === space.owner_id

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">🌸</div>
        <h1 className="font-display text-2xl text-brand-brown mb-2">공간을 찾을 수 없습니다</h1>
        <p className="font-sans text-sm text-brand-brown/60 mb-6">삭제되었거나 존재하지 않는 공간입니다.</p>
        <Link to="/dashboard" className="btn-primary">대시보드로 돌아가기</Link>
      </div>
    )
  }

  const lifespan = space.birth_year && space.death_year
    ? `${space.birth_year} — ${space.death_year} (향년 ${space.death_year - space.birth_year}세)`
    : space.birth_year ? `${space.birth_year}년 출생`
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-cream">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            id="view-back"
            className="flex items-center gap-2 text-brand-brown/60 hover:text-brand-brown transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-sans text-sm hidden sm:block">내 공간 목록</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">S2</span>
            </div>
            <span className="font-display text-sm text-brand-brown">STAGE2</span>
          </div>

          {isOwner && (
            <Link
              to={`/space/${id}/edit`}
              id="view-edit"
              className="btn-secondary text-sm px-4 py-2"
            >
              편집
            </Link>
          )}
        </div>
      </header>

      {/* 커버 히어로 */}
      <div className="pt-16">
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-brand-cream to-brand-green/20 relative overflow-hidden">
          {space.cover_image_url && (
            <img src={space.cover_image_url} alt="" className="w-full h-full object-cover opacity-40" />
          )}
          {/* 장식 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">🌸</div>
          </div>
        </div>
      </div>

      {/* 프로필 영역 */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-16 mb-6">
          {/* 아바타 */}
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gradient-to-br from-primary/40 to-brand-green/30 flex items-center justify-center shadow-card mb-4 overflow-hidden">
            {space.profile_image_url ? (
              <img src={space.profile_image_url} alt={space.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl text-brand-brown/30">
                {space.name?.[0]}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block bg-primary/10 text-primary text-xs font-sans font-bold px-3 py-1 rounded-full">
                  {RELATIONSHIP_LABELS[space.relationship] || '소중한 분'}
                </span>
                {space.is_self && (
                  <span className="inline-block bg-brand-green/10 text-brand-green text-xs font-sans font-bold px-3 py-1 rounded-full">
                    사전 기록
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl text-brand-brown">{space.name}</h1>
              {lifespan && (
                <p className="font-sans text-sm text-brand-brown/50 mt-1">{lifespan}</p>
              )}
            </div>
          </div>
        </div>

        {/* 한 줄 소개 */}
        {space.bio && (
          <blockquote className="border-l-4 border-primary pl-5 py-2 mb-8">
            <p className="font-serif text-base text-brand-brown/80 italic leading-relaxed">
              "{space.bio}"
            </p>
          </blockquote>
        )}

        {/* 탭 */}
        <div className="flex gap-1 bg-brand-cream rounded-xl p-1 mb-8 w-fit">
          {[
            { id: 'story', label: '📖 인생 이야기' },
            { id: 'memories', label: '🎬 추억 영상관' },
            { id: 'voice', label: '🎙️ 목소리 보관함' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`view-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-white text-brand-brown shadow-sm'
                  : 'text-brand-brown/50 hover:text-brand-brown/70'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="pb-16">

          {/* 인생 이야기 탭 */}
          {activeTab === 'story' && (
            <div>
              {space.life_story ? (
                <div className="card">
                  <h2 className="font-display text-xl text-brand-brown mb-4">인생 이야기</h2>
                  <div className="font-sans text-base text-brand-brown/80 leading-relaxed whitespace-pre-wrap">
                    {space.life_story}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-brand-cream/30 rounded-2xl border-2 border-dashed border-brand-cream">
                  <div className="text-4xl mb-3">📖</div>
                  <p className="font-display text-lg text-brand-brown mb-2">아직 이야기가 없습니다</p>
                  <p className="font-sans text-sm text-brand-brown/50 mb-4">
                    소중한 분의 인생 이야기를 기록해주세요.
                  </p>
                  {isOwner && (
                    <Link
                      to={`/space/${id}/edit`}
                      id="view-story-edit"
                      className="btn-primary text-sm inline-block"
                    >
                      이야기 작성하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 추억 영상관 탭 - 준비 중 */}
          {activeTab === 'memories' && (
            <div className="text-center py-16 bg-brand-cream/30 rounded-2xl border-2 border-dashed border-brand-cream">
              <div className="text-4xl mb-3">🎬</div>
              <p className="font-display text-lg text-brand-brown mb-2">추억 영상관</p>
              <p className="font-sans text-sm text-brand-brown/50">
                사진과 영상을 업로드하는 기능이 곧 준비됩니다.
              </p>
              <div className="mt-4 inline-block bg-primary/10 text-primary text-xs font-sans font-bold px-3 py-1 rounded-full">
                Coming Soon
              </div>
            </div>
          )}

          {/* 목소리 보관함 탭 - 준비 중 */}
          {activeTab === 'voice' && (
            <div className="text-center py-16 bg-brand-cream/30 rounded-2xl border-2 border-dashed border-brand-cream">
              <div className="text-4xl mb-3">🎙️</div>
              <p className="font-display text-lg text-brand-brown mb-2">목소리 보관함</p>
              <p className="font-sans text-sm text-brand-brown/50">
                음성 메시지를 남기는 기능이 곧 준비됩니다.
              </p>
              <div className="mt-4 inline-block bg-primary/10 text-primary text-xs font-sans font-bold px-3 py-1 rounded-full">
                Coming Soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
