/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nmd: {
          bg: "#0D1B2A",        // Dark navy from PDF
          accent: "#1AA6B7",    // Cyan/Teal accent from PDF
          accentHover: "#158b99",
          blue: "#0F2847",      // Secondary panel color
          glass: "rgba(255,255,255,0.06)",
        },
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
