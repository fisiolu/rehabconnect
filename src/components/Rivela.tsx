"use client";

import { useCallback, useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  /** Ritardo in millisecondi: serve a far comparire più elementi a scaletta. */
  ritardo?: number;
  className?: string;
  /** Elemento HTML da usare, per non rompere la struttura della pagina. */
  come?: "div" | "li" | "section" | "span";
}

/**
 * Fa comparire il contenuto quando entra nello schermo, con una salita breve.
 *
 * Tre cautele, tutte volute:
 * - il contenuto è già nell'HTML: viene solo mostrato, quindi resta leggibile
 *   dai motori di ricerca e da chi usa un lettore di schermo;
 * - senza JavaScript la classe `js` non viene messa e il CSS non nasconde
 *   nulla, così la pagina resta comunque leggibile;
 * - chi ha chiesto meno animazioni al sistema operativo non vede muoversi
 *   niente, perché la regola CSS vive dentro `prefers-reduced-motion`.
 *
 * Il riferimento all'elemento è una funzione e non un oggetto: il tag cambia
 * (div, li, section, span) e un riferimento tipizzato su uno solo di essi non
 * sarebbe assegnabile agli altri.
 */
export default function Rivela({
  children,
  ritardo = 0,
  className = "",
  come: Tag = "div",
}: Props) {
  const [nodo, setNodo] = useState<HTMLElement | null>(null);
  const [visibile, setVisibile] = useState(false);

  const riferimento = useCallback((elemento: HTMLElement | null) => {
    setNodo(elemento);
  }, []);

  useEffect(() => {
    if (!nodo || visibile) return;

    // Se il browser non sa osservare lo scorrimento, mostro e basta.
    if (typeof IntersectionObserver === "undefined") {
      setVisibile(true);
      return;
    }

    const osservatore = new IntersectionObserver(
      (voci) => {
        if (voci.some((v) => v.isIntersecting)) {
          setVisibile(true);
          osservatore.disconnect();
        }
      },
      // Parte poco prima che l'elemento sia del tutto visibile: così il
      // movimento è già finito quando l'occhio ci arriva.
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    osservatore.observe(nodo);
    return () => osservatore.disconnect();
  }, [nodo, visibile]);

  return (
    <Tag
      ref={riferimento}
      className={`rivela ${visibile ? "rivela-visibile" : ""} ${className}`}
      style={ritardo ? { transitionDelay: `${ritardo}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
