/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0D1F2D',
        gold: '#E8A020',
        'navy-light': '#1A3A5C',
      },
    },
  },
  plugins: [],
};
