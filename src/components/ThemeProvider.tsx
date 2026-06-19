"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "chiaro" | "scuro";

interface TemaCtx {
  tema: Tema;
  toggleTema: () => void;
  testoGrande: boolean;
  toggleTesto: () => void;
}

const TemaContext = createContext<TemaCtx>({
  tema: "chiaro",
  toggleTema: () => {},
  testoGrande: false,
  toggleTesto: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("chiaro");
  const [testoGrande, setTestoGrande] = useState(false);

  useEffect(() => {
    const salvato = localStorage.getItem("rc-tema") as Tema | null;
    const preferisce = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const iniziale: Tema = salvato ?? (preferisce ? "scuro" : "chiaro");
    setTema(iniziale);
    document.documentElement.classList.toggle("dark", iniziale === "scuro");

    const grande = localStorage.getItem("rc-testo") === "1";
    setTestoGrande(grande);
    document.documentElement.classList.toggle("testo-grande", grande);
  }, []);

  function toggleTema() {
    setTema((prev) => {
      const nuovo: Tema = prev === "chiaro" ? "scuro" : "chiaro";
      document.documentElement.classList.toggle("dark", nuovo === "scuro");
      localStorage.setItem("rc-tema", nuovo);
      return nuovo;
    });
  }

  function toggleTesto() {
    setTestoGrande((prev) => {
      const nuovo = !prev;
      document.documentElement.classList.toggle("testo-grande", nuovo);
      localStorage.setItem("rc-testo", nuovo ? "1" : "0");
      return nuovo;
    });
  }

  return (
    <TemaContext.Provider value={{ tema, toggleTema, testoGrande, toggleTesto }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
