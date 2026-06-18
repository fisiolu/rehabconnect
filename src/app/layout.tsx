import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import ToastContainer from "@/components/ToastContainer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "RehabConnect",
  description: "Piattaforma per la riabilitazione domiciliare",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RehabConnect",
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
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/api/icon-192" />
      </head>
      <body>
        <AppProvider>
          {children}
          <ToastContainer />
          <ServiceWorkerRegister />
        </AppProvider>
      </body>
    </html>
  );
}
