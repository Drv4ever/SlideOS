/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Add 'serif' key to use system default serif or custom ones set via CSS/Google Fonts.
        serif: ['"Instrument Serif"' ,'var(--font-serif)' ,'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif',],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
