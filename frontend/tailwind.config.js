/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ── DESIGN.md design tokens ──────────────────────────────────────
        // Dark canvas — near-pure black (#010102)
        canvas:  '#010102',

        // Surface ladder (dark)
        's1':    '#0f1011',
        's2':    '#141516',
        's3':    '#18191a',
        's4':    '#191a1b',

        // Hairline borders
        'hl':    '#23252a',   // default
        'hl-s':  '#34343a',   // strong
        'hl-t':  '#3e3e44',   // tertiary

        // Accent — lavender blue
        'accent':       '#5e6ad2',
        'accent-hover': '#828fff',
        'accent-press': '#5e69d1',
        'accent-muted': '#7a7fad',

        // Ink (text hierarchy — dark)
        'ink':         '#f7f8f8',
        'ink-muted':   '#d0d6e0',
        'ink-subtle':  '#8a8f98',
        'ink-3':       '#62666d',

        // Semantic
        'semantic-success': '#27a644',

        // ── Existing brand palette (preserved for light mode components) ──
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        teal: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
      },

      boxShadow: {
        // DESIGN.md: surface-ladder depth (no real drop shadows on dark)
        'card':      '0 0 0 1px rgba(35,37,42,1)',   // hairline only
        'card-hover':'0 0 0 1px rgba(52,52,58,1), 0 4px 16px rgba(0,0,0,0.40)',
        'card-lift': '0 4px 24px rgba(0,0,0,0.50)',

        // Light mode cards
        'card-light':      '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(203,213,225,0.8)',
        'card-light-hover':'0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(165,180,252,0.5)',

        // Focus
        'focus-accent': '0 0 0 2px rgba(94,106,210,0.50)',

        // Glow (lavender — use very sparingly)
        'glow-sm':  '0 0 12px rgba(94,106,210,0.20)',
        'glow':     '0 0 24px rgba(94,106,210,0.25)',
        'glow-lg':  '0 0 40px rgba(94,106,210,0.30)',

        // Legacy — kept for compatibility
        'float':    '0 8px 32px rgba(0,0,0,0.12)',
        'float-lg': '0 16px 48px rgba(0,0,0,0.16)',
      },

      borderRadius: {
        // DESIGN.md radius tokens
        'token-xs':   '4px',
        'token-sm':   '6px',
        'token-md':   '8px',   // buttons, inputs
        'token-lg':   '12px',  // cards
        'token-xl':   '16px',  // panels
        'token-xxl':  '24px',  // CTA banners
        // Tailwind standard (keep for compatibility)
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      animation: {
        'fade-in':       'fadeIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        'fade-up':       'fadeUp 0.40s cubic-bezier(0.16,1,0.3,1)',
        'fade-up-slow':  'fadeUp 0.60s cubic-bezier(0.16,1,0.3,1)',
        'slide-right':   'slideRight 0.30s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':      'scaleIn 0.20s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':       'shimmer 1.6s infinite linear',
        'pulse-dot':     'pulseDot 2s ease-in-out infinite',
        'scan-line':     'scanLine 1.5s ease-in-out infinite',
        'progress-fill': 'progressFill 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'counter':       'fadeUp 0.50s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow':     'spin 8s linear infinite',
        'float':         'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        progressFill: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },

      backgroundImage: {
        // DESIGN.md — no atmospheric gradients. These are intentional utilities.
        'gradient-brand':   'linear-gradient(135deg, #4338ca 0%, #5e6ad2 100%)',
        'gradient-subtle':  'linear-gradient(180deg, rgba(94,106,210,0.05) 0%, transparent 100%)',
        // Grid overlay for hero
        'grid-pattern':     `linear-gradient(rgba(35,37,42,0.6) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(35,37,42,0.6) 1px, transparent 1px)`,
        // Shimmer
        'shimmer-dark':     'linear-gradient(90deg, #0f1011 0%, #141516 50%, #0f1011 100%)',
        'shimmer-light':    'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      letterSpacing: {
        'display-xl': '-0.187em',   // -3px at 16px base ≈ proportional
        'display-lg': '-0.032em',
        'display-md': '-0.025em',
        'tight-2':    '-0.021em',   // -0.6px at 28px
        'card-title': '-0.018em',
        'eyebrow':    '0.031em',    // +0.4px
      },
    },
  },
  plugins: [],
}
