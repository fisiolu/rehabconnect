"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Menu, X } from "lucide-react";
import LogoUfficiale from "@/components/LogoUfficiale";

const linkNav = [
  { href: "#come-funziona", label: "Come funziona" },
  { href: "#percorsi", label: "Aree riservate" },
  { href: "#sicurezza", label: "Sicurezza e privacy" },
];

export default function HeaderHome() {
  const [menuAperto, setMenuAperto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Fisioterapista Domiciliare — torna alla home"
        >
          <LogoUfficiale dimensione={42} />
          <span
            className="font-bold text-notte dark:text-white leading-[1.05] text-[15px] sm:text-base"
            aria-hidden="true"
          >
            Fisioterapista
            <br />
            <span className="text-primary-600 dark:text-primary-400">Domiciliare</span>
          </span>
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
          <Link
            href="/trova"
            className="inline-flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <MapPin size={15} aria-hidden="true" />
            Cerca vicino a me
          </Link>
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
          <Link
            href="/trova"
            onClick={() => setMenuAperto(false)}
            className="flex items-center justify-center gap-1.5 text-center bg-primary-600 text-white font-semibold py-3 rounded-lg mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <MapPin size={16} aria-hidden="true" />
            Cerca vicino a me
          </Link>
        </nav>
      )}
    </header>
  );
}
