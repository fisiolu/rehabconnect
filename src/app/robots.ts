import type { MetadataRoute } from "next";
import { urlSito } from "@/lib/sito";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og e le icone devono restare raggiungibili: sono l'immagine che
        // compare quando il link viene condiviso e l'icona dell'app installata.
        allow: ["/", "/trova", "/api/og", "/api/icon-192", "/api/icon-512"],
        // Le aree riservate e i documenti personali non vanno nei motori di ricerca.
        disallow: ["/dashboard/", "/chat/", "/referto/", "/mappa", "/api/"],
      },
    ],
    sitemap: `${urlSito()}/sitemap.xml`,
  };
}
