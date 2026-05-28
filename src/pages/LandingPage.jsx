import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── 더미 추모 공간 데이터 ──
const DUMMY_SPACES = [
  {
    id: 'demo-1',
    name: '김영수',
    years: '1942 — 2024',
    age: '82세',
    relation: '아버지',
    bio: '평생 가족을 위해 헌신하셨던 따뜻한 분. 새벽같이 일어나 밥상을 차려주시던 손이 아직도 눈에 선합니다.',
    story_count: 12,
    photo_count: 47,
    visitor_count: 238,
    profile_img: '/profile-man.png',
    cover_color: 'from-stone-900 to-zinc-900',
    last_visit: '오늘',
  },
  {
    id: 'demo-2',
    name: '이순자',
    years: '1950 — 2023',
    age: '73세',
    relation: '어머니',
    bio: '된장찌개 냄새와 함께 늘 그 자리에 계셨던 분. 전화기 너머 "밥은 먹었어?"가 그리운 요즘입니다.',
    story_count: 8,
    photo_count: 63,
    visitor_count: 185,
    profile_img: '/profile-woman.png',
    cover_color: 'from-zinc-900 to-neutral-900',
    last_visit: '3일 전',
  },
  {
    id: 'demo-3',
    name: '박철호',
    years: '1938 — 2025',
    age: '87세',
    relation: '할아버지',
    bio: '6.25 전쟁을 버텨내고 가족을 일으켜 세우신 분. 손자 무릎에 앉혀 들려주시던 옛날 이야기가 보물입니다.',
    story_count: 5,
    photo_count: 29,
    visitor_count: 94,
    profile_img: null,
    cover_color: 'from-neutral-900 to-stone-900',
    last_visit: '1주일 전',
  },
]

// ── 기능 소개 데이터 ──
const FEATURES = [
  {
    icon: '📖',
    title: '인생 이야기',
    tag: 'STORY',
    desc: '출생부터 현재까지, 삶의 크고 작은 이야기를 챕터별로 기록합니다. 글로, 사진으로, 목소리로.',
  },
  {
    icon: '🎬',
    title: '추억 영상관',
    tag: 'STAGE',
    desc: '가족이 함께 사진과 영상을 올리면 자동으로 아름다운 추억 앨범이 만들어집니다.',
  },
  {
    icon: '🎙️',
    title: '목소리 보관함',
    tag: 'MEMORY',
    desc: '생전에 남긴 음성 메시지를 생일, 기일 등 특별한 날에 가족에게 전달합니다.',
  },
]

// ── 통계 ──
const STATS = [
  { value: '2,400+', label: '소중한 기억 보관 중' },
  { value: '18,000+', label: '업로드된 추억 사진' },
  { value: '4.9★', label: '가족 만족도' },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: 'rgba(255,255,255,0.85)' }}>

      {/* ════════════════════════════════
          헤더
      ════════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: '64px', display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#F2D49B', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '14px', color: '#080808' }}>S2</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '18px', color: '#fff', letterSpacing: '-0.01em' }}>
              STAGE2
            </span>
          </div>

          {/* 네비 */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ height: '40px', fontSize: '14px', padding: '0 20px' }}>
                내 추모 공간 →
              </Link>
            ) : (
              <>
                <Link to="/auth" id="nav-signin"
                  style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', fontWeight: 600,
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px',
                    transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >
                  로그인
                </Link>
                <Link to="/auth?tab=signup" id="nav-signup" className="btn-primary"
                  style={{ height: '40px', fontSize: '14px', padding: '0 20px' }}>
                  무료 시작
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ════════════════════════════════
          히어로 섹션
      ════════════════════════════════ */}
      <section style={{ paddingTop: '160px', paddingBottom: '120px', paddingLeft: '24px', paddingRight: '24px', position: 'relative', overflow: 'hidden' }}>

        {/* 배경 효과 */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(242,212,155,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* 태그 */}
          <div className="tag-gold" style={{ marginBottom: '32px', display: 'inline-flex' }}>
            <span>✦</span>
            <span>Life Legacy Platform</span>
          </div>

          {/* 헤드라인 */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(40px, 6vw, 68px)',
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '28px',
          }}>
            소중한 사람의 이야기를<br />
            <em style={{ color: '#F2D49B', fontStyle: 'italic' }}>영원히 간직합니다</em>
          </h1>

          {/* 서브 */}
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.8,
            maxWidth: '520px',
            margin: '0 auto 48px',
          }}>
            인생 이야기, 사진, 목소리를 하나의 공간에 담아<br />
            언제 어디서든 다시 만날 수 있는 온라인 추모 공간
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?tab=signup" id="hero-cta-primary" className="btn-primary">
              무료로 추모 공간 만들기
            </Link>
            <a href="#spaces" id="hero-cta-secondary" className="btn-ghost">
              실제 사례 보기 ↓
            </a>
          </div>

          {/* 신뢰 지표 */}
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '64px', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: '#F2D49B' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          실제 추모 공간 예시 (더미)
      ════════════════════════════════ */}
      <section id="spaces" style={{ paddingTop: '80px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* 섹션 헤더 */}
          <div style={{ marginBottom: '56px' }}>
            <div className="tag-gold" style={{ marginBottom: '20px', display: 'inline-flex' }}>
              <span>추모 공간 예시</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: '12px' }}>
              이미 소중한 분들이<br />이 곳에 머물고 있습니다
            </h2>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.45)' }}>
              실제 서비스 화면을 미리 확인해보세요
            </p>
          </div>

          {/* 카드 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {DUMMY_SPACES.map((space, i) => (
              <div key={space.id} className="card-dark" style={{ padding: '28px', animationDelay: `${i * 0.1}s` }}>
                {/* 카드 헤더 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                  {/* 프로필 이미지 */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                    border: '2px solid rgba(242,212,155,0.3)',
                    overflow: 'hidden', background: '#1A1A1A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {space.profile_img ? (
                      <img src={space.profile_img} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: 'rgba(255,255,255,0.3)' }}>
                        {space.name[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', fontWeight: 700,
                        color: '#F2D49B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {space.relation}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                      {space.name}
                    </div>
                    <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {space.years} · {space.age}
                    </div>
                  </div>
                </div>

                {/* 인용 */}
                <blockquote style={{
                  borderLeft: '2px solid rgba(242,212,155,0.4)',
                  paddingLeft: '16px',
                  marginBottom: '24px',
                }}>
                  <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontStyle: 'italic' }}>
                    "{space.bio}"
                  </p>
                </blockquote>

                {/* 통계 */}
                <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                  {[
                    { icon: '📖', val: space.story_count, label: '이야기' },
                    { icon: '🖼️', val: space.photo_count, label: '사진' },
                    { icon: '👥', val: space.visitor_count, label: '방문' },
                  ].map((stat, j) => (
                    <div key={j} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '18px', fontWeight: 700, color: '#F2D49B' }}>
                        {stat.val}
                      </div>
                      <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 마지막 방문 */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    마지막 방문 {space.last_visit}
                  </span>
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#F2D49B', fontWeight: 600 }}>
                    공간 보기 →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link to="/auth?tab=signup" id="spaces-cta" className="btn-primary">
              나만의 추모 공간 만들기
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3가지 기능 소개
      ════════════════════════════════ */}
      <section style={{ paddingTop: '80px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px',
        borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0D0D0D' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <div className="tag-gold" style={{ marginBottom: '20px', display: 'inline-flex' }}>
              <span>서비스 소개</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
              기억을 담는 세 가지 방법
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {FEATURES.map((f, i) => (
              <div key={f.tag} style={{
                padding: '36px 32px',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(242,212,155,0.2)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* 배경 숫자 */}
                <div style={{
                  position: 'absolute', top: '20px', right: '24px',
                  fontFamily: "'Playfair Display', serif", fontSize: '80px', fontWeight: 700,
                  color: 'rgba(255,255,255,0.03)', lineHeight: 1,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>

                <div className="tag-gold" style={{ marginBottom: '16px', display: 'inline-flex', fontSize: '11px' }}>
                  {f.tag}
                </div>

                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                  {f.title}
                </h3>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          감성 인용 섹션
      ════════════════════════════════ */}
      <section style={{ paddingTop: '100px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(242,212,155,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.3 }}>"</div>
          <blockquote style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.9,
            fontStyle: 'italic',
            marginBottom: '32px',
          }}>
            살아있는 동안 당신의 이야기를 남기세요.<br />
            그것이 당신이 사랑했던 사람들에게<br />
            줄 수 있는 가장 큰 선물입니다.
          </blockquote>
          <div style={{ width: '40px', height: '1px', background: '#F2D49B', margin: '0 auto 20px', opacity: 0.5 }} />
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            STAGE2 창립자
          </p>
        </div>
      </section>

      {/* ════════════════════════════════
          하단 CTA
      ════════════════════════════════ */}
      <section style={{
        paddingTop: '80px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, #0D0D0D 0%, #080808 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', background: '#F2D49B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
          }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '24px', color: '#080808' }}>S2</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: '16px' }}>
            지금 시작하세요
          </h2>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: '40px' }}>
            소중한 이야기는 지금 이 순간부터 기록할 수 있습니다.<br />
            가입은 무료이며 언제든지 시작할 수 있습니다.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?tab=signup" id="footer-cta-primary" className="btn-primary">
              무료로 시작하기
            </Link>
            <Link to="/auth" id="footer-cta-login" className="btn-gold-outline">
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          푸터
      ════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
          © 2025 STAGE2 · Life Legacy Platform · 소중한 삶을 영원히
        </p>
      </footer>

    </div>
  )
}
