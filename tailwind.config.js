/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        arabic: ['Poppins', 'sans-serif'],
      },
      colors: {
        sage: {
          50:  '#f2f7f4',
          100: '#e0ede6',
          200: '#c1dace',
          300: '#93c0a9',
          400: '#5f9f83',
          500: '#3d8265',
          600: '#2d6850',
          700: '#255342',
          800: '#1f4336',
          900: '#1a372d',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#faf7ef',
          200: '#f5eedb',
          300: '#ede0bf',
        },
        gold: {
          300: '#f0c97a',
          400: '#e8b84b',
          500: '#d4a017',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in':     'fadeIn 0.6s ease-out',
        'slide-up':    'slideUp 0.5s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'shimmer':     'shimmer 2s infinite',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                            to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' },  to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        float:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
