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
        // Surface system — zinc-based for premium OLED feel
        surface: {
          950: '#09090b',  // App background
          900: '#18181b',  // Card/panel background
          800: '#27272a',  // Elevated surfaces
          700: '#3f3f46',  // Borders, dividers
          600: '#52525b',  // Hover borders
          500: '#71717a',  // Muted text
          400: '#a1a1aa',  // Secondary text
          300: '#d4d4d8',  // Light mode text
          200: '#e4e4e7',  // Light mode borders
          100: '#f4f4f5',  // Light mode surfaces
          50:  '#fafafa',  // Primary text (dark mode)
        },
        // Accent — indigo
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: '#4f46e5',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        // Semantic
        success: {
          DEFAULT: '#22c55e',
          muted: 'rgba(34, 197, 94, 0.12)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245, 158, 11, 0.12)',
        },
        danger: {
          DEFAULT: '#ef4444',
          muted: 'rgba(239, 68, 68, 0.12)',
        },
        info: {
          DEFAULT: '#06b6d4',
          muted: 'rgba(6, 182, 212, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',     { lineHeight: '1' }],
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg':    '0 0 40px rgba(99, 102, 241, 0.2)',
        'card':       '0 1px 3px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'elevated':   '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease forwards',
        'fade-in-up':   'fadeInUp 0.4s ease forwards',
        'scale-in':     'scaleIn 0.3s ease forwards',
        'slide-right':  'slideRight 0.3s ease forwards',
        'slide-down':   'slideDown 0.3s ease forwards',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'toast-in':     'toastIn 0.3s ease forwards',
        'toast-out':    'toastOut 0.3s ease forwards',
        'slide-up':     'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to:   { opacity: '0', transform: 'translateX(100%)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
