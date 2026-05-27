/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // STAGE2 디자인 토큰
        primary: {
          DEFAULT: '#C9A84C',  // 따뜻한 골드 - 기억, 소중함
          light: '#DFC277',
          dark: '#A07A2A',
        },
        background: {
          DEFAULT: '#FDFBF7',  // 크림화이트 - 따뜻함
          card: '#FFFFFF',
        },
        brand: {
          brown: '#2C1810',    // 딥브라운 - 신뢰
          green: '#7BA05B',    // 소프트그린 - 생명, 성장
          cream: '#F5F0E8',    // 베이지 - 배경 변형
        },
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 60대 사용자 접근성 기준 (최소 16px)
        'xs': ['14px', { lineHeight: '1.5' }],
        'sm': ['16px', { lineHeight: '1.5' }],
        'base': ['18px', { lineHeight: '1.6' }],
        'lg': ['20px', { lineHeight: '1.6' }],
        'xl': ['24px', { lineHeight: '1.4' }],
        '2xl': ['30px', { lineHeight: '1.3' }],
        '3xl': ['36px', { lineHeight: '1.2' }],
      },
      spacing: {
        // 최소 터치 영역 48px 기준
        'touch': '48px',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(44, 24, 16, 0.08)',
        'card-hover': '0 8px 32px rgba(44, 24, 16, 0.15)',
      },
    },
  },
  plugins: [],
}
