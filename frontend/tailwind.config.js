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
        // Premium color system
        background: 'var(--color-bg)',
        foreground: 'var(--color-fg)',
        border: 'var(--color-border)',
        primary: {
          DEFAULT: '#f59e0b', // Amber
          hover: '#d97706',
        },
        success: {
          DEFAULT: '#10b981', // Emerald
          hover: '#059669',
        },
        severity: {
          high: '#ef4444',    // Red
          medium: '#f59e0b',  // Amber
          low: '#eab308',     // Yellow
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'breath': 'breath 3s ease-in-out infinite',
        'blink': 'blink 1.5s step-end infinite',
        'pulse-beam': 'pulseBeam 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseBeam: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
