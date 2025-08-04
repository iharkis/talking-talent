/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hippo': {
          'dark-blue': '#15243D',
          'teal': '#005E5D',
          'teal-hover': '#004C4B',
          'light-gray': '#DDE4E6',
          'dark-text': '#0C2340',
          'white': '#FFFFFF',
        },
      },
      fontFamily: {
        'sans': ['DM Sans', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'hippo': '28px',
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}