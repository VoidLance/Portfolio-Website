/**
 * Tailwind CSS Configuration
 * ================================================
 * 
 * This configuration file sets up Tailwind CSS for the Pokémon Finder project.
 * 
 * To use this configuration:
 * 1. Install Tailwind CSS: npm install -D tailwindcss
 * 2. Generate CSS: npx tailwindcss -i input.css -o styles.css
 * 3. For development with watch mode: npx tailwindcss -i input.css -o styles.css --watch
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Specify which files to scan for Tailwind class names
  content: [
    './index.html',           // Main HTML file
    './src/**/*.{js,ts}',     // Any TypeScript/JavaScript files in src
  ],

  // Theme customization - extend or override default Tailwind theme
  theme: {
    extend: {
      // Custom color palette
      colors: {
        // Transparent and standard colors
        transparent: 'transparent',
        white: '#FFFFFF',
        black: '#000000',

        // Custom color scheme for Pokémon Finder
        primary: '#667eea',   // Indigo - main brand color
        secondary: '#764ba2', // Purple - accent color
        success: '#51cf66',   // Green - for resistances
        danger: '#ff6b6b',    // Red - for weaknesses
        warning: '#ffd93d',   // Yellow - for warnings
        info: '#4da3ff',      // Light Blue - for info
      },

      // Custom font families
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },

      // Custom spacing values
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Custom breakpoints for responsive design
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },

  // Plugins for extending Tailwind functionality
  plugins: [
    // Add any Tailwind plugins here
    // Example: require('@tailwindcss/forms'),
  ],
};
