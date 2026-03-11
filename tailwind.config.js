/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in-out": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "10%": { opacity: "1", transform: "translateY(0)" },
          "80%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in-out": "fade-in-out 2.5s ease-in-out forwards",
      },
    },
  },
  plugins: [],
}

