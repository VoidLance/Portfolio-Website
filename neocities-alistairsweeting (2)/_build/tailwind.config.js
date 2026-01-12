/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.html',
    './**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'indie': {
          'bg-dark': '#181820',
          'bg-main': '#2f085e',
          'bg-sidebar': '#241445',
          'bg-nav': '#13092D',
          'accent-green': '#43ea7c',
          'accent-pink': '#ED64F5',
          'accent-purple': '#4b0c75',
          'text-light': '#fceaff',
          'text-gray': '#e6e6e6',
        },
      },
      fontFamily: {
        'asul': ['Asul', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'indie': '2px 6px 15px rgba(45, 167, 223, 0.604)',
        'indie-sm': '0 4px 13px rgba(45, 167, 223, 0.404)',
        'indie-glow': '0 0 8px #43ea7c',
      },
    },
  },
  plugins: [],
}
