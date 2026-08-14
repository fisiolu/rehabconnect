import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Scala completa del blu. Mancavano 200, 300, 400, 800 e 900, ma
         * l'app le usava in 25 punti: Tailwind le ignorava in silenzio,
         * lasciando smorti soprattutto i testi del tema scuro. Le tonalità
         * già presenti erano quelle del blu di Tailwind, quindi le mancanti
         * sono le sue, per non spostare di un capello ciò che si vedeva.
         */
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        notte: "#12324A",
        sfondo: "#F6FAFC",
      },
    },
  },
  plugins: [],
};

export default config;
