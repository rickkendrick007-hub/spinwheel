/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050403',
        panel: '#0b0908',
        panelSoft: '#14110d',
        electric: '#7b8f49',
        gold: '#d9a34b',
        ember: '#7c4e1c'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(217,163,75,.10), 0 24px 90px rgba(0, 0, 0, .58)',
        gold: '0 0 24px rgba(217,163,75,.22)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top, rgba(152,98,36,0.28), transparent 34%), radial-gradient(circle at 80% 18%, rgba(109,133,65,0.15), transparent 18%), linear-gradient(180deg, #050403 0%, #090705 38%, #030302 100%)'
      }
    }
  },
  plugins: []
};
