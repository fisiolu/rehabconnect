"use client";

import { useApp } from "@/lib/AppContext";

const icona: Record<string, string> = {
  successo: "✅",
  errore: "❌",
  info: "ℹ️",
};

const colore: Record<string, string> = {
  successo: "bg-green-600",
  errore: "bg-red-600",
  info: "bg-blue-600",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colore[t.tipo]} text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-2`}
        >
          <span className="text-lg shrink-0">{icona[t.tipo]}</span>
          <p className="text-sm font-medium flex-1">{t.messaggio}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white transition-colors text-lg leading-none"
            aria-label="Chiudi notifica"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
