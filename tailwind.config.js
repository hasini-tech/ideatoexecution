/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50: '#effaf3', 100: '#d8f3e1', 200: '#b3e6c6', 300: '#80d2a1', 400: '#4ab879',
          500: '#25a05e', 600: '#17814b', 700: '#14673e', 800: '#135234', 900: '#10442d',
        },
        ink: { DEFAULT: '#0f1f17', soft: '#4b5b52', mute: '#8a978f' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,68,45,.05), 0 8px 24px -12px rgba(16,68,45,.16)',
        fab: '0 10px 24px -6px rgba(23,129,75,.55)',
        nav: '0 -8px 30px -12px rgba(16,68,45,.18)',
      },
      keyframes: {
        sheet: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        pop: { '0%': { transform: 'scale(.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        drop: { from: { transform: 'translateY(-16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: {
        sheet: 'sheet .28s cubic-bezier(.2,.8,.2,1)',
        fade: 'fade .2s ease-out',
        pop: 'pop .22s cubic-bezier(.2,.8,.2,1)',
        drop: 'drop .25s ease-out',
      },
    },
  },
  plugins: [],
};
