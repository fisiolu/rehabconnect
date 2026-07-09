"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const linkNav = [
  { href: "#come-funziona", label: "Come funziona" },
  { href: "#percorsi", label: "Per i professionisti" },
  { href: "#sicurezza", label: "Sicurezza e privacy" },
];

export default function HeaderHome() {
  const [menuAperto, setMenuAperto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-notte dark:text-white text-lg shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="RehabConnect — torna alla home"
        >
          <span className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.5 8.5l7 7" />
            </svg>
          </span>
          RehabConnect
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Navigazione principale">
          {linkNav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block shrink-0">
          <a
            href="#percorsi"
            className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Accedi
          </a>
        </div>

        <button
          className="md:hidden p-2 text-notte dark:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onClick={() => setMenuAperto((v) => !v)}
          aria-expanded={menuAperto}
          aria-controls="menu-mobile-home"
          aria-label={menuAperto ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
        >
          {menuAperto ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {menuAperto && (
        <nav
          id="menu-mobile-home"
          className="md:hidden border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-1"
          aria-label="Navigazione mobile"
        >
          {linkNav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuAperto(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#percorsi"
            onClick={() => setMenuAperto(false)}
            className="block text-center bg-primary-600 text-white font-semibold py-2.5 rounded-lg mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Accedi
          </a>
        </nav>
      )}
    </header>
  );
}
