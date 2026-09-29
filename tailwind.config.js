/** @type {import('tailwindcss').Config} */

// Les couleurs du site sont définies une seule fois dans src/styles.css (variables CSS),
// avec une version claire et une version sombre. Ici on les rend utilisables par Tailwind.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        serif: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
      },
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        soft: token("soft"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        accent: {
          DEFAULT: token("accent"),
          ink: token("accent-ink"),
          soft: token("accent-soft"),
        },
        // Couleurs officielles des étiquettes énergie
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
      },
      maxWidth: {
        page: "80rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
