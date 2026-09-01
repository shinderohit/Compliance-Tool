/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#18206F",
        gold: "#D4AF37",
        lightgray: "#CBCBD4",
        background: "#F8F9FC",
      },
    },
  },

  plugins: [],
};