/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        surface: '#111118',
        border: '#1E1E2E',
        raise: '#FFD447',
        nay: '#FF6B6B',
        signal: '#6BFFE4',
        pulse: '#C56CF0',
        muted: '#6B6B8A',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        fraunces: ['Fraunces', 'serif'],
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.4s infinite',
        wave: 'wave 2.4s infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        wave: {
          '0%,60%,100%': { transform: 'rotate(0deg)' },
          '10%,30%': { transform: 'rotate(18deg)' },
          '20%': { transform: 'rotate(-6deg)' },
        },
      },
    },
  },
  plugins: [],
};
