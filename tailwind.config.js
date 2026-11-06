/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warehouse: {
          bg: '#0A0E1A',
          card: '#111827',
          panel: '#161F33',
          border: '#1F2E4A',
          accent: '#06B6D4', // Cyan
          accentGlow: 'rgba(6, 182, 212, 0.25)',
          success: '#10B981', // Emerald
          warning: '#F59E0B', // Amber
          danger: '#EF4444', // Red
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
