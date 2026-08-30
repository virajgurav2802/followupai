/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ivory: {
          DEFAULT: '#F7F6F2',
          light: '#FAF9F6',
          dark: '#EFECE6',
        },
        forest: {
          DEFAULT: '#1F5C48',
          hover: '#174635',
          dark: '#12231D',
          darker: '#0B1713',
          light: '#2A7A60',
          subtle: '#EAF3EF',
        },
        brass: {
          DEFAULT: '#B58A52',
          light: '#F8F4EE',
          dark: '#946E3D',
          border: '#DFCEB6',
        },
        ink: {
          primary: '#171A17',
          secondary: '#687068',
          muted: '#8D968D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9F8F5',
        },
        border: {
          DEFAULT: '#E4E2DC',
          subtle: '#ECEAE4',
          focus: '#1F5C48',
        },
        status: {
          success: '#2F7D5B',
          'success-subtle': '#EEF7F2',
          warning: '#B7791F',
          'warning-subtle': '#FEF7EC',
          error: '#B94A48',
          'error-subtle': '#FDF2F2',
          neutral: '#687068',
          'neutral-subtle': '#F2F1ED',
        },
      },
      borderRadius: {
        btn: '8px',
        input: '8px',
        card: '12px',
        modal: '16px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(18, 35, 29, 0.04)',
        'card': '0 1px 3px 0 rgba(18, 35, 29, 0.05), 0 1px 2px -1px rgba(18, 35, 29, 0.05)',
        'elevated': '0 4px 6px -1px rgba(18, 35, 29, 0.06), 0 2px 4px -2px rgba(18, 35, 29, 0.05)',
        'modal': '0 10px 25px -5px rgba(18, 35, 29, 0.1), 0 8px 10px -6px rgba(18, 35, 29, 0.05)',
      },
    },
  },
  plugins: [],
}
