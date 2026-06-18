"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[SW] Registrato con successo"))
        .catch((err) => console.warn("[SW] Registrazione fallita:", err));
    }
  }, []);

  return null;
}
