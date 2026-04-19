/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      /* ── Typography ─────────────────────────────────── */
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },

      /* ── Colour Palette (VCEP-2026) ─────────────────── */
      colors: {
        primary: {
          DEFAULT: '#1B2F6E',   // Kemenkumham Blue
          dark: '#142352',      // Darker Blue
          light: '#E8EAF1',     // Tinted Blue
        },
        secondary: {
          DEFAULT: '#F5B800',   // Kemenkumham Gold
          dark: '#D49E00',
          light: '#FFF7E0',
        },
        navy: {
          DEFAULT: '#1B2F6E',   // Heading text (mapped to Kemenkumham Blue)
          mid: '#2D3E6D',
        },
        muted: '#A3AED0',     // Label / sub-text
        success: '#01B574',     // Status Active
        bg: {
          DEFAULT: '#F8FAFC',   // App background
          card: '#FFFFFF',   // Card / sidebar
        },
      },

      /* ── Border Radius ──────────────────────────────── */
      borderRadius: {
        '3xl': '24px',
        '2xl': '20px',   // Cards
        xl: '15px',   // Inputs
        lg: '12px',   // Buttons
      },

      /* ── Shadows ────────────────────────────────────── */
      boxShadow: {
        soft: '0 10px 15px -3px rgba(0,0,0,0.05)',
        card: '40px 40px 40px 0px rgba(112,144,176,0.08)',
        inner: 'inset 0 1px 3px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
