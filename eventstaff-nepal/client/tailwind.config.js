/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060912',
        surface: '#0d1118',
        'surface-raised': '#131a24',
        flame: {
          DEFAULT: '#e8681e',
          light: '#f5a85c',
          dark: '#b5511a',
          muted: 'rgba(232, 104, 30, 0.12)',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#dfc673',
          muted: 'rgba(201, 168, 76, 0.12)',
        },
        sage: {
          DEFAULT: '#6baf8a',
          muted: 'rgba(107, 175, 138, 0.12)',
        },
        crimson: {
          DEFAULT: '#cc3b3b',
          muted: 'rgba(204, 59, 59, 0.12)',
        },
        ice: '#89b4cc',
        parchment: '#ede8e0',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-flame': 'linear-gradient(135deg, #e8681e 0%, #f5a85c 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c9a84c 0%, #dfc673 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0d1118 0%, #060912 100%)',
      },
      boxShadow: {
        'flame': '0 0 30px rgba(232, 104, 30, 0.2)',
        'flame-lg': '0 0 60px rgba(232, 104, 30, 0.35)',
        'gold': '0 0 20px rgba(201, 168, 76, 0.2)',
        'inner': 'inset 0 1px 0 rgba(255,255,255,0.04)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'modal': '0 24px 80px rgba(0,0,0,0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'float': 'float 10s ease-in-out infinite',
        'pulse-flame': 'pulseFlame 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-24px)' },
        },
        pulseFlame: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(232, 104, 30, 0.6)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 18px rgba(232, 104, 30, 0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1.25rem',
        '3xl': '2rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
