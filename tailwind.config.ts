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
         * Palette allineata a quella del sito fisioterapistadomiciliare.it
         * (stesso "--color-brand"/coral/ink), così passare dal sito
         * all'app è un continuum e non un cambio di prodotto. L'app tiene
         * comunque una voce propria: dove il sito usa il verde-teal caldo
         * del logo, qui l'accento principale (primary/blue) vira su un
         * teal più freddo e "digitale" — stessa famiglia, sfumatura diversa.
         *
         * Si sovrascrivono le scale native `gray`, `slate`, `blue` e `teal`
         * di Tailwind invece di introdurre nuovi nomi: sono già usate in
         * decine di file, quindi il resoconto cromatico si applica ovunque
         * senza dover rititolare ogni componente.
         */

        // Neutri: gray e slate coincidono, con una punta di teal invece del
        // grigio puro. Ai due estremi arrivano vicino a sfondo e notte.
        gray: {
          50: "#f6faf9",
          100: "#eaf3f1",
          200: "#d6e6e2",
          300: "#b6d1cb",
          400: "#8fb2ab",
          500: "#6c928c",
          600: "#52746f",
          700: "#405a57",
          800: "#2c433f",
          900: "#1c2f2c",
          950: "#101f1d",
        },
        slate: {
          50: "#f6faf9",
          100: "#eaf3f1",
          200: "#d6e6e2",
          300: "#b6d1cb",
          400: "#8fb2ab",
          500: "#6c928c",
          600: "#52746f",
          700: "#405a57",
          800: "#2c433f",
          900: "#1c2f2c",
          950: "#101f1d",
        },

        // Accento principale dell'app: teal-blu più freddo del brand del
        // sito, per una relazione di famiglia senza essere identici.
        primary: {
          50: "#eef7fa",
          100: "#d7edf3",
          200: "#b3dce7",
          300: "#82c3d3",
          400: "#4fa3ba",
          500: "#2f84a0",
          600: "#1f6a85",
          700: "#1c5670",
          800: "#1c475c",
          900: "#1b3c4d",
          950: "#0f2733",
        },
        blue: {
          50: "#eef7fa",
          100: "#d7edf3",
          200: "#b3dce7",
          300: "#82c3d3",
          400: "#4fa3ba",
          500: "#2f84a0",
          600: "#1f6a85",
          700: "#1c5670",
          800: "#1c475c",
          900: "#1b3c4d",
          950: "#0f2733",
        },

        // Teal ancorato esattamente al verde-acqua del logo: il punto di
        // contatto più diretto con il sito.
        teal: {
          50: "#eafbf9",
          100: "#cdf3ee",
          200: "#9de6dc",
          300: "#69d2c5",
          400: "#45bcae",
          500: "#33ada4",
          600: "#22857e",
          700: "#1d6b65",
          800: "#1a5551",
          900: "#184744",
          950: "#0a2826",
        },

        // Corallo del logo: stesso ruolo di call-to-action condivisa con
        // il sito (il bottone "Apri l'app" è già di questo colore).
        coral: {
          50: "#fef2f0",
          100: "#fde3de",
          200: "#fbc7bd",
          300: "#f7a394",
          400: "#f6876f",
          500: "#f4674f",
          600: "#de4b33",
          700: "#b93a26",
          800: "#942f1f",
          900: "#78281c",
        },

        // "notte": stesso verde-petrolio scuro delle sezioni ad alto
        // contrasto del sito (--color-brand-ink), usato per i titoli e
        // per gli sfondi scuri dell'app.
        notte: "#0f3d3a",
        // "sfondo": bianco caldo con la stessa punta di teal del
        // --color-cream del sito, al posto del bianco-blu di prima.
        sfondo: "#f5faf8",
      },
    },
  },
  plugins: [],
};

export default config;
