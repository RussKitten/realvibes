/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        gost: {
          stroke: '#000000',
          fill: '#ffffff',
          fillAlt: '#f2f2f2',
          accent: '#1e40af',
        },
      },
    },
  },
  plugins: [],
};
