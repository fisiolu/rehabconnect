"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "chiaro" | "scuro";

const TemaContext = createContext<{ tema: Tema; toggleTema: () => void }>({
  tema: "chiaro",
  toggleTema: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("chiaro");

  useEffect(() => {
    const salvato = localStorage.getItem("rc-tema") as Tema | null;
    const preferisce = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const iniziale: Tema = salvato ?? (preferisce ? "scuro" : "chiaro");
    setTema(iniziale);
    document.documentElement.classList.toggle("dark", iniziale === "scuro");
  }, []);

  function toggleTema() {
    setTema((prev) => {
      const nuovo: Tema = prev === "chiaro" ? "scuro" : "chiaro";
      document.documentElement.classList.toggle("dark", nuovo === "scuro");
      localStorage.setItem("rc-tema", nuovo);
      return nuovo;
    });
  }

  return (
    <TemaContext.Provider value={{ tema, toggleTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
