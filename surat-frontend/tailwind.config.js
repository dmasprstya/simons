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
          DEFAULT: '#4D7CFF',   // Primary Blue
          dark:    '#2D68FF',   // Hover / active state
          light:   '#EEF3FF',   // Tint / badge bg
        },
        navy: {
          DEFAULT: '#1B2559',   // Heading text
          mid:     '#2D3E6D',
        },
        muted:   '#A3AED0',     // Label / sub-text
        success: '#01B574',     // Status Active
        bg: {
          DEFAULT: '#F8FAFC',   // App background
          card:    '#FFFFFF',   // Card / sidebar
        },
      },

      /* ── Border Radius ──────────────────────────────── */
      borderRadius: {
        '3xl': '24px',
        '2xl': '20px',   // Cards
        xl:    '15px',   // Inputs
        lg:    '12px',   // Buttons
      },

      /* ── Shadows ────────────────────────────────────── */
      boxShadow: {
        soft:  '0 10px 15px -3px rgba(0,0,0,0.05)',
        card:  '40px 40px 40px 0px rgba(112,144,176,0.08)',
        inner: 'inset 0 1px 3px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
