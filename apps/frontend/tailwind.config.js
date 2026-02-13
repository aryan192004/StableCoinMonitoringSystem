/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* DARK BASE */
        background: '#0B0F17',
        surface: '#111827',
        surfaceElevated: '#182233',
        surfaceHover: '#1F2A3A',
        border: '#1F2937',

        /* TEXT */
        textPrimary: '#E5E7EB',
        textSecondary: '#9CA3AF',
        textMuted: '#6B7280',

        /* NEON ACCENTS */
        primary: '#22D3EE',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#F43F5E',
      },

      boxShadow: {
        card: '0 6px 30px rgba(0,0,0,0.6)',
        hover: '0 10px 40px rgba(0,0,0,0.8)',
        neon: '0 0 20px rgba(34,211,238,0.25)',
      },

      borderRadius: {
        xl2: '14px',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
