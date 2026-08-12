import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ToastContainer from "@/components/ToastContainer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { CLAIM, DESCRIZIONE, NOME_SITO, urlSito } from "@/lib/sito";

const BASE = urlSito();
const TITOLO = `${NOME_SITO} — ${CLAIM}`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: TITOLO,
  description: DESCRIZIONE,
  applicationName: NOME_SITO,
  keywords: [
    "fisioterapista a domicilio",
    "fisioterapia domiciliare",
    "fisioterapista a casa",
    "riabilitazione a domicilio",
    "fisioterapista vicino a me",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: NOME_SITO,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: NOME_SITO,
    title: TITOLO,
    description: DESCRIZIONE,
    url: BASE,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Fisioterapista Domiciliare — il Fisioterapista a casa tua, vicino davvero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITOLO,
    description: DESCRIZIONE,
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  // Nessun limite allo zoom: chi ha difficoltà di vista deve poter ingrandire
  // la pagina pizzicando lo schermo.
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/api/icon-192" />
        {/* Dati strutturati: spiegano ai motori di ricerca che cos'è questo sito.
            Nessuna recensione o valutazione dichiarata, perché non ne abbiamo di reali. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${BASE}/#sito`,
                  url: BASE,
                  name: NOME_SITO,
                  description: DESCRIZIONE,
                  inLanguage: "it-IT",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${BASE}/trova`,
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Service",
                  "@id": `${BASE}/#servizio`,
                  name: "Ricerca di Fisioterapisti a domicilio",
                  serviceType: "Fisioterapia domiciliare",
                  description: DESCRIZIONE,
                  areaServed: { "@type": "Country", name: "Italia" },
                  provider: { "@id": `${BASE}/#sito` },
                  audience: { "@type": "Patient" },
                },
              ],
            }),
          }}
        />
        {/* Anti-FOUC: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');try{var t=localStorage.getItem('rc-tema');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='scuro'||(!t&&p))document.documentElement.classList.add('dark');if(localStorage.getItem('rc-testo')==='1')document.documentElement.classList.add('testo-grande')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppProvider>
            {children}
            <ToastContainer />
            <ServiceWorkerRegister />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
