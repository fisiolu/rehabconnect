"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RisultatoRicerca } from "@/lib/geo";
import { formattaDistanza } from "@/lib/geo";
import {
  figuraPer,
  htmlSegnaposto,
  htmlTuSeiQui,
  MISURE_TU_SEI_QUI,
} from "@/lib/figurine";

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
 * dei Fisioterapisti. Toccando un segnaposto si apre la sua scheda.
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

      // La freccina che indica il punto esatto del paziente.
      L.marker([centro.lat, centro.lng], {
        icon: L.divIcon({
          className: "",
          html: htmlTuSeiQui(),
          iconSize: [MISURE_TU_SEI_QUI.larghezza, MISURE_TU_SEI_QUI.altezza],
          // Il centro del pallino deve cadere esattamente sulle coordinate.
          iconAnchor: [MISURE_TU_SEI_QUI.larghezza / 2, MISURE_TU_SEI_QUI.centroPallino],
        }),
        zIndexOffset: 1000,
      }).addTo(mappa);

      risultati.forEach(({ fisioterapista, distanzaKm, raggiungibile }) => {
        const colore = !fisioterapista.disponibile
          ? "#94a3b8"
          : raggiungibile
            ? "#33ada4"
            : "#f59e0b";

        const marker = L.marker([fisioterapista.base.lat, fisioterapista.base.lng], {
          icon: L.divIcon({
            className: "",
            html: htmlSegnaposto(
              formattaDistanza(distanzaKm),
              colore,
              figuraPer(fisioterapista.id)
            ),
            iconSize: [50, 52],
            iconAnchor: [25, 52],
          }),
        }).addTo(mappa);

        marker.on("click", () => onSelezionaRef.current(fisioterapista.id));
        markersRef.current[fisioterapista.id] = marker;
      });

      // Inquadratura iniziale: l'utente più i Fisioterapisti più vicini.
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
      const elemento = marker.getElement()?.querySelector(".rc-fig");
      elemento?.classList.toggle("rc-fig-attivo", id === selezionatoId);
    });

    if (!selezionatoId || !mapRef.current) return;
    const scelto = risultati.find((r) => r.fisioterapista.id === selezionatoId);
    if (scelto) {
      mapRef.current.panTo([scelto.fisioterapista.base.lat, scelto.fisioterapista.base.lng]);
    }
  }, [selezionatoId, risultati]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
