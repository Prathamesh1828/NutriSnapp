import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0F',
          surface: '#13131A',
          accent: '#B8FF3C',
          glow: '#10b981',
          secondary: '#f97316',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(184, 255, 60, 0.3)',
        'glow-teal': '0 0 20px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;