/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        val: {
          red: '#FF4655',
          'red-hover': '#e03947',
          'red-dark': '#be2230',
          black: '#0f1923',
          dark: '#161e25',
          surface: '#1f272e',
          'surface-card': '#232d36',
          border: '#323f4b',
          'border-light': '#475666',
          white: '#ECE8E1',
          muted: '#8b97a2',
          cyan: '#00F5D4',
          'cyan-dark': '#00bfa5',
          gold: '#FFB800',
        }
      },
      fontFamily: {
        tactical: ['Tungsten', 'Rajdhani', 'Oswald', 'Impact', 'sans-serif'],
        display: ['Rajdhani', 'Chakra Petch', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'val-red': '0 0 20px -3px rgba(255, 70, 85, 0.45)',
        'val-cyan': '0 0 20px -3px rgba(0, 245, 212, 0.45)',
        'val-gold': '0 0 20px -3px rgba(255, 184, 0, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
