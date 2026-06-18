"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MarkerDati {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  label: string;
}

interface Props {
  markers: MarkerDati[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function MappaLeaflet({
  markers,
  height = "400px",
  center,
  zoom = 13,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let mapInstance: LeafletMap | null = null;

    import("leaflet").then(({ default: L }) => {
      if (disposed || !containerRef.current) return;

      mapInstance = L.map(containerRef.current, {
        center: center ?? [45.466, 9.19],
        zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      markers.forEach((m) => {
        const icon = L.divIcon({
          html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(1px 2px 3px rgba(0,0,0,0.4));">${m.emoji}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });
        L.marker([m.lat, m.lng], { icon })
          .addTo(mapInstance!)
          .bindPopup(`<strong>${m.label}</strong>`);
      });

      if (markers.length > 1) {
        const bounds = L.latLngBounds(
          markers.map((m) => [m.lat, m.lng] as [number, number])
        );
        mapInstance.fitBounds(bounds, { padding: [40, 40] });
      } else if (markers.length === 1) {
        mapInstance.setView([markers[0].lat, markers[0].lng], 15);
      }
    });

    return () => {
      disposed = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, [markers, center, zoom]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}
