import type { MetadataRoute } from "next";
import { urlSito } from "@/lib/sito";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSito();
  // Data fissa: cambiarla a ogni build direbbe ai motori che la pagina è cambiata
  // anche quando non è vero, e col tempo fa perdere credibilità alla sitemap.
  const aggiornato = new Date("2026-08-11");

  return [
    {
      url: base,
      lastModified: aggiornato,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/trova`,
      lastModified: aggiornato,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
