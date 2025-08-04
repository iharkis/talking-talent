/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hippo Digital Primary Colors
        'hippo': {
          'dark-blue': '#0c2340',
          'green': '#005e5d',
          'green-hover': '#004c4b',
          'teal': '#88dbdf',
          'pink': '#ffa3b5',
          'background': '#e5ebf0',
          'text': '#322947',
          'white': '#ffffff',
          // Legacy support for existing classes
          'light-gray': '#e5ebf0',
          'dark-text': '#322947',
          'teal-hover': '#004c4b',
        },
        // Standard aliases for common usage
        'primary': '#0c2340',
        'secondary': '#005e5d',
        'accent': '#88dbdf',
      },
      fontFamily: {
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': '18px',
      },
      lineHeight: {
        'base': '1.7',
      },
      borderRadius: {
        'hippo': '28px',
        'hippo-subtle': '8px',
      },
      boxShadow: {
        'hippo': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'hippo-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}