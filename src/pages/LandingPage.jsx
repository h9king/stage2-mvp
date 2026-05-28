import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-brand-cream">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S2</span>
            </div>
            <span className="font-display font-semibold text-brand-brown text-lg tracking-wide">STAGE2</span>
          </div>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                id="landing-go-dashboard"
                className="btn-primary text-sm px-5 py-2.5"
              >
                내 추모 공간
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  id="landing-signin"
                  className="btn-secondary text-sm px-5 py-2.5"
                >
                  로그인
                </Link>
                <Link
                  to="/auth?tab=signup"
                  id="landing-signup"
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  시작하기
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-24 px-4 text-center relative">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* 태그라인 */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-sans font-semibold mb-8">
            <span>✦</span>
            <span>Life Legacy Platform</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="font-display text-4xl md:text-5xl text-brand-brown leading-tight mb-6">
            기억되고 싶은 삶을<br />
            <span className="text-primary">이야기로 남기다</span>
          </h1>

          <p className="font-sans text-base text-brand-brown/70 max-w-xl mx-auto mb-10 leading-relaxed">
            소중한 사람의 인생 이야기, 사진, 목소리를 영원히 보존하세요.<br />
            언제든지 다시 만날 수 있는 온라인 추모 공간을 만들어드립니다.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth?tab=signup"
              id="landing-cta-primary"
              className="btn-primary text-base px-8 py-4 w-full sm:w-auto"
            >
              무료로 추모 공간 만들기
            </Link>
            <a
              href="#how-it-works"
              id="landing-cta-secondary"
              className="btn-secondary text-base px-8 py-4 w-full sm:w-auto"
            >
              어떻게 작동하나요?
            </a>
          </div>
        </div>
      </section>

      {/* 특징 카드 섹션 */}
      <section id="how-it-works" className="py-20 px-4 bg-brand-cream/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl text-brand-brown mb-3">세 가지 방법으로 기억합니다</h2>
            <p className="font-sans text-sm text-brand-brown/60">생전에 직접 기록하거나, 가족이 함께 완성합니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📖',
                title: 'SPACE',
                subtitle: '인생 이야기',
                desc: '출생부터 현재까지의 삶의 이야기, 소중한 기억, 가치관을 기록합니다.',
              },
              {
                icon: '🎬',
                title: 'STAGE',
                subtitle: '추억 영상관',
                desc: '사진과 영상으로 만드는 나만의 인생 하이라이트 앨범입니다.',
              },
              {
                icon: '🎙️',
                title: 'MEMORY',
                subtitle: '목소리 보관함',
                desc: '사랑하는 사람에게 남기는 음성 메시지를 특별한 날에 전달합니다.',
              },
            ].map((item) => (
              <div key={item.title} className="card hover:shadow-card-hover transition-shadow duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="inline-block bg-primary/10 text-primary text-xs font-sans font-bold px-3 py-1 rounded-full mb-3">
                  {item.title}
                </div>
                <h3 className="font-display text-xl text-brand-brown mb-2">{item.subtitle}</h3>
                <p className="font-sans text-sm text-brand-brown/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-brand-brown mb-4">
            지금 시작하세요
          </h2>
          <p className="font-sans text-sm text-brand-brown/60 mb-8">
            소중한 사람의 이야기는 지금 바로 기록을 시작할 때가 가장 좋은 시간입니다.
          </p>
          <Link
            to="/auth?tab=signup"
            id="landing-bottom-cta"
            className="btn-primary text-base px-10 py-4 inline-block"
          >
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 border-t border-brand-cream text-center">
        <p className="font-sans text-xs text-brand-brown/40">
          © 2025 STAGE2 · Life Legacy Platform · 소중한 삶을 영원히
        </p>
      </footer>
    </div>
  )
}
