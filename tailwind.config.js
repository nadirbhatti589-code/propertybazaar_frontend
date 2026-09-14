/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6F0',
        ink: '#2B2420',
        brand: {
          50: '#FBEDEA',
          400: '#C25C48',
          500: '#A63D2F',
          600: '#8F3226',
          700: '#73271D',
        },
        teal: {
          50: '#E7F2EF',
          400: '#2E8A78',
          500: '#1F6F63',
          600: '#175A50',
        },
        gold: {
          400: '#D7A340',
          500: '#C08A2E',
        },
        sand: {
          50: '#FAF6F0',
          100: '#F2EAE0',
          200: '#E4D8C8',
          400: '#B7A793',
          600: '#8C7B6B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
