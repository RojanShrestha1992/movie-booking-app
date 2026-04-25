/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#111827',
          ember: '#F97316',
          gold: '#FACC15',
          mist: '#F3F4F6',
          slate: '#1F2937',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(17, 24, 39, 0.15)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.25), transparent 35%), radial-gradient(circle at 85% 30%, rgba(250, 204, 21, 0.25), transparent 30%), linear-gradient(135deg, #111827 0%, #1F2937 45%, #0F172A 100%)',
      },
    },
  },
  plugins: [],
};
