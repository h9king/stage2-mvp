import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import MemoryGallery from '../components/MemoryGallery'

const RELATIONSHIP_LABELS = {
  spouse: '배우자', parent: '부모님', child: '자녀',
  sibling: '형제/자매', grandparent: '조부모님',
  friend: '친구/지인', self: '본인 기록', other: '소중한 분',
}

const TABS = [
  { id: 'story',    icon: '📖', label: '인생 이야기' },
  { id: 'memories', icon: '🎬', label: '추억 영상관' },
  { id: 'voice',    icon: '🎙️', label: '목소리 보관함' },
]

export default function SpaceViewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('story')

  useEffect(() => { fetchSpace() }, [id])

  const fetchSpace = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('spaces').select('*').eq('id', id).single()
    if (error || !data) setNotFound(true)
    else setSpace(data)
    setLoading(false)
  }

  const isOwner = user && space && user.id === space.owner_id

  /* ── 로딩 ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(242,212,155,0.2)', borderTopColor: '#F2D49B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  /* ── 404 ── */
  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕊️</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#fff', marginBottom: '8px' }}>공간을 찾을 수 없습니다</h1>
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>삭제되었거나 존재하지 않는 공간입니다.</p>
      <Link to="/dashboard" className="btn-primary">대시보드로 돌아가기</Link>
    </div>
  )

  const lifespan = space.birth_year && space.death_year
    ? `${space.birth_year} — ${space.death_year}  ·  향년 ${space.death_year - space.birth_year}세`
    : space.birth_year ? `${space.birth_year}년 출생` : null

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'rgba(255,255,255,0.85)' }}>

      {/* ── 헤더 ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', height: '64px',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" id="view-back" style={{
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            color: 'rgba(255,255,255,0.5)', fontFamily: 'Pretendard, sans-serif', fontSize: '14px',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span style={{ display: 'none' }}>목록으로</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F2D49B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '12px', color: '#080808' }}>S2</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#fff' }}>STAGE2</span>
          </div>

          {isOwner ? (
            <Link to={`/space/${id}/edit`} id="view-edit" className="btn-gold-outline"
              style={{ height: '36px', fontSize: '13px', padding: '0 16px' }}>
              편집
            </Link>
          ) : <div style={{ width: '60px' }} />}
        </div>
      </header>

      {/* ── 커버 히어로 ── */}
      <div style={{ paddingTop: '64px' }}>
        <div style={{
          height: '220px',
          background: space.cover_image_url
            ? `url(${space.cover_image_url}) center/cover`
            : 'linear-gradient(135deg, #1A1500 0%, #0D0D0D 50%, #0A1A0A 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 오버레이 */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,8,0.1), rgba(8,8,8,0.7))' }} />
          {/* 배경 글로우 */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(242,212,155,0.08) 0%, transparent 70%)',
          }} />
        </div>
      </div>

      {/* ── 프로필 ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ position: 'relative', marginTop: '-56px', marginBottom: '32px' }}>
          {/* 아바타 */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            border: '3px solid rgba(242,212,155,0.4)',
            background: '#1A1A1A', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            marginBottom: '20px',
          }}>
            {space.profile_image_url
              ? <img src={space.profile_image_url} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: 'rgba(255,255,255,0.2)' }}>{space.name?.[0]}</span>
            }
          </div>

          {/* 태그 + 이름 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  background: 'rgba(242,212,155,0.1)', color: '#F2D49B', border: '1px solid rgba(242,212,155,0.25)',
                  borderRadius: '100px', padding: '4px 12px',
                  fontFamily: 'Pretendard, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {RELATIONSHIP_LABELS[space.relationship] || '소중한 분'}
                </span>
                {space.is_self && (
                  <span style={{
                    background: 'rgba(74,222,128,0.08)', color: 'rgb(74,222,128)', border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '100px', padding: '4px 12px',
                    fontFamily: 'Pretendard, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  }}>
                    사전 기록
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, color: '#fff', lineHeight: 1.2, margin: 0 }}>
                {space.name}
              </h1>
              {lifespan && (
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  {lifespan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 한 줄 소개 */}
        {space.bio && (
          <blockquote style={{
            borderLeft: '3px solid rgba(242,212,155,0.5)',
            paddingLeft: '20px', marginBottom: '40px', margin: '0 0 40px 0',
          }}>
            <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, fontStyle: 'italic', margin: 0 }}>
              "{space.bio}"
            </p>
          </blockquote>
        )}

        {/* 탭 */}
        <div style={{ display: 'flex', gap: '4px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '4px', marginBottom: '32px', width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab.id} id={`view-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
              background: activeTab === tab.id ? '#F2D49B' : 'transparent',
              color: activeTab === tab.id ? '#080808' : 'rgba(255,255,255,0.4)',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── 탭 콘텐츠 ── */}
        <div style={{ paddingBottom: '80px' }}>

          {/* 인생 이야기 */}
          {activeTab === 'story' && (
            space.life_story ? (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>
                  인생 이야기
                </h2>
                <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.95, whiteSpace: 'pre-wrap' }}>
                  {space.life_story}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: '#111', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>📖</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '8px' }}>아직 이야기가 없습니다</p>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                  소중한 분의 인생 이야기를 기록해주세요.
                </p>
                {isOwner && (
                  <Link to={`/space/${id}/edit`} id="view-story-edit" className="btn-primary">
                    이야기 작성하기
                  </Link>
                )}
              </div>
            )
          )}

          {/* 추억 영상관 — MemoryGallery */}
          {activeTab === 'memories' && (
            <MemoryGallery spaceId={id} isOwner={isOwner} />
          )}

          {/* 목소리 보관함 — Coming Soon */}
          {activeTab === 'voice' && (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#111', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>🎙️</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '8px' }}>목소리 보관함</p>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>
                음성 메시지를 남기는 기능이 곧 준비됩니다.
              </p>
              <span style={{ background: 'rgba(242,212,155,0.1)', color: '#F2D49B', border: '1px solid rgba(242,212,155,0.25)', borderRadius: '100px', padding: '6px 16px', fontFamily: 'Pretendard, sans-serif', fontSize: '12px', fontWeight: 700 }}>
                Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
