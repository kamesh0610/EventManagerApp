/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom brown/beige palette
        cream: {
          10: '#FBF2E7',
          50: '#F2E5D2',   // Very light beige / off-white
          100: '#EBD9C5',  // Light pastel beige
          200: '#D9C9B3',  // Light cream beige
          300: '#C39C78',  // Soft coffee brown
          400: '#9B6C4A',  // Medium brown
          500: '#6A4A3A',  // Dark cocoa brown
          600: '#5A3E30',  // Darker brown
          700: '#4A3226',  // Very dark brown
          800: '#3A261C',  // Almost black brown
          900: '#2A1A12',  // Deep brown
        },
        // Keep existing colors for compatibility
        primary: {
          50: '#F2E5D2',
          100: '#EBD9C5',
          200: '#D9C9B3',
          300: '#C39C78',
          400: '#9B6C4A',
          500: '#6A4A3A',
          600: '#5A3E30',
          700: '#4A3226',
          800: '#3A261C',
          900: '#2A1A12',
        }
      },
    },
  },
  plugins: [],
};