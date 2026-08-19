"use client";

import { apriPreferenzeCookie } from "@/components/MetaPixel";

/**
 * Riapre il banner del consenso. Serve perché revocare deve essere facile
 * quanto acconsentire: senza, la prima scelta resterebbe definitiva.
 */
export default function BottonePreferenzeCookie({
  className = "",
  etichetta = "Gestisci preferenze cookie",
}: {
  className?: string;
  etichetta?: string;
}) {
  return (
    <button type="button" onClick={apriPreferenzeCookie} className={className}>
      {etichetta}
    </button>
  );
}
