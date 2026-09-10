/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d1ff",
          300: "#8ab2ff",
          400: "#5a8bff",
          500: "#3366ff",
          600: "#2149db",
          700: "#1a39ad",
          800: "#182f89",
          900: "#182a6e",
        },
      },
    },
  },
  plugins: [],
};
