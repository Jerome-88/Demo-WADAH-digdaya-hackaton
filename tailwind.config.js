/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        deep: '#1E1B4B',
        indigo: { DEFAULT: '#4F46E9', dark: '#3730A3', light: '#EEF2FF' },
        teal: { DEFAULT: '#0F766E', light: '#ECFDF5' },
        green: { DEFAULT: '#059669', light: '#D1FAE5' },
        amber: { DEFAULT: '#D97706', light: '#FEF3C7' },
        purple: { DEFAULT: '#7C3AED' },
        bg: '#F8F7FF',
      },
      animation: {
        'fade-in': 'fadeIn .4s ease both',
        'pop': 'pop .35s cubic-bezier(.34,1.56,.64,1) both',
        'spin-fast': 'spin .8s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pop:    { from: { opacity: '0', transform: 'scale(.87)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}

