"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RisultatoRicerca } from "@/lib/geo";
import { formattaDistanza } from "@/lib/geo";

interface Props {
  /** Posizione del paziente: il puntino "sei qui". */
  centro: { lat: number; lng: number };
  risultati: RisultatoRicerca[];
  selezionatoId: string | null;
  onSeleziona: (id: string) => void;
  height?: string;
}

/**
 * Mappa in stile "car sharing": al centro c'è l'utente, attorno i segnaposto
 * dei fisioterapisti. Toccando un segnaposto si apre la sua scheda.
 */
export default function MappaRicerca({
  centro,
  risultati,
  selezionatoId,
  onSeleziona,
  height = "100%",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  // Tenuto in un ref perché la mappa va costruita una sola volta: passarlo
  // come dipendenza dell'effetto la farebbe ricreare a ogni render.
  const onSelezionaRef = useRef(onSeleziona);
  onSelezionaRef.current = onSeleziona;

  // Costruzione della mappa e dei segnaposto.
  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    import("leaflet").then(({ default: L }) => {
      if (disposed || !containerRef.current || mapRef.current) return;

      const mappa = L.map(containerRef.current, {
        center: [centro.lat, centro.lng],
        zoom: 12,
        zoomControl: true,
      });
      mapRef.current = mappa;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mappa);

      // Il puntino azzurro pulsante: "sei qui".
      L.marker([centro.lat, centro.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="rc-tu"><span class="rc-tu-alone"></span><span class="rc-tu-punto"></span></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        zIndexOffset: 1000,
      })
        .addTo(mappa)
        .bindPopup("<strong>Tu sei qui</strong>");

      risultati.forEach(({ fisioterapista, distanzaKm, raggiungibile }) => {
        const colore = !fisioterapista.disponibile
          ? "#94a3b8"
          : raggiungibile
            ? "#14b8a6"
            : "#f59e0b";

        const marker = L.marker([fisioterapista.base.lat, fisioterapista.base.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="rc-pin" style="--rc-colore:${colore}">
                     <span class="rc-pin-testo">${formattaDistanza(distanzaKm)}</span>
                   </div>`,
            iconSize: [58, 30],
            iconAnchor: [29, 30],
          }),
        }).addTo(mappa);

        marker.on("click", () => onSelezionaRef.current(fisioterapista.id));
        markersRef.current[fisioterapista.id] = marker;
      });

      // Inquadratura iniziale: l'utente più i fisioterapisti più vicini.
      const daInquadrare = risultati.slice(0, 5);
      if (daInquadrare.length > 0) {
        const bounds = L.latLngBounds([
          [centro.lat, centro.lng],
          ...daInquadrare.map(
            (r) => [r.fisioterapista.base.lat, r.fisioterapista.base.lng] as [number, number]
          ),
        ]);
        mappa.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    });

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, [centro, risultati]);

  // Quando cambia la selezione: evidenzia il segnaposto e centra la mappa su di esso.
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const elemento = marker.getElement()?.querySelector(".rc-pin");
      elemento?.classList.toggle("rc-pin-attivo", id === selezionatoId);
    });

    if (!selezionatoId || !mapRef.current) return;
    const scelto = risultati.find((r) => r.fisioterapista.id === selezionatoId);
    if (scelto) {
      mapRef.current.panTo([scelto.fisioterapista.base.lat, scelto.fisioterapista.base.lng]);
    }
  }, [selezionatoId, risultati]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
