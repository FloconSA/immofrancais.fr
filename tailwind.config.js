/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/@material-tailwind/**/*.{html,js,ts,jsx,tsx,mdx}"

  ],
  theme: {
    extend: {
      colors: {
        "immo-blue": {
          DEFAULT: "#7DC8FB"
        },
        DPE: {
          A: "#319C6D",
          B: "#54B254",
          C: "#79BD76",
          D: "#F3E70C",
          E: "#F0B510",
          F: "#EB8237",
          G: "#D8221F",
        },
        GES: {
          A: "#A4DBF8",
          B: "#8DB3D3",
          C: "#7893B2",
          D: "#616F8B",
          E: "#4C5270",
          F: "#3A3553",
          G: "#2A1B36",
        },
      }
    },
  },
  plugins: [],
};
