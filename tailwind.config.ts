import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dceafe',
          200: '#bad4fd',
          300: '#8cb5fa',
          400: '#5b8ef7',
          500: '#3a6ff2',
          600: '#2650e6',
          700: '#1f40c3',
          800: '#1c36a0',
          900: '#1c3181',
          950: '#121f4d'
        }
      }
    }
  },
  plugins: [animate]
};

export default config;
