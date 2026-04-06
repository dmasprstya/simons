/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          mid: '#1A3555',
        },
        accent: {
          DEFAULT: '#2A7FD4',
          light: '#EBF4FD',
        },
      },
    },
  },
  plugins: [],
}
