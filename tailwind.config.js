/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#06080d',
          800: '#0b0f17',
          700: '#111827',
          600: '#1a2333',
        },
        accent: {
          lime: '#b6ff3b',
          cyan: '#22d3ee',
          rose: '#f43f5e',
          amber: '#f59e0b',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(182, 255, 59, 0.35)',
        'glow-cyan': '0 0 22px rgba(34, 211, 238, 0.35)',
        'glow-rose': '0 0 22px rgba(244, 63, 94, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-fast': 'ping 0.9s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
