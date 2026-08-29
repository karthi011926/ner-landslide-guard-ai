/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ner: {
          dark: "#0b1329",
          card: "#132142",
          accent: "#38bdf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
          border: "#1e293b"
        }
      }
    },
  },
  plugins: [],
}
