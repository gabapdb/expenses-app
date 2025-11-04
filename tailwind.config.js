/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css", // ✅ fixed glob pattern
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
