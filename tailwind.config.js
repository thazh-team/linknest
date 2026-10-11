/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Sora','Inter','sans-serif']
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 2px 10px rgba(0,0,0,0.05)',
        'soft-lg': '0 10px 30px rgba(0,0,0,0.07)'
      },
      animation: {
        in: 'in 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out'
      },
      keyframes: {
        in: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      }
    }
  },
  plugins: []
}
