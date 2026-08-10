import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ToastContainer from "@/components/ToastContainer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Fisioterapista Domiciliare — Trova chi lavora vicino a te",
  description:
    "Vedi sulla mappa quali fisioterapisti a domicilio lavorano nella tua zona, con le loro specialità e la distanza da casa tua.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fisioterapista Domiciliare",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        {/* Anti-FOUC: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('rc-tema');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='scuro'||(!t&&p))document.documentElement.classList.add('dark');if(localStorage.getItem('rc-testo')==='1')document.documentElement.classList.add('testo-grande')}catch(e){}`,
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
