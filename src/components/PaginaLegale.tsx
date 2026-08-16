import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoUfficiale from "@/components/LogoUfficiale";

/**
 * Impaginazione comune a informativa privacy e termini di servizio.
 * Testo largo il giusto e corpo generoso: sono pagine che vanno lette, spesso
 * da persone anziane o dai loro familiari.
 */
export default function PaginaLegale({
  titolo,
  aggiornamento,
  children,
}: {
  titolo: string;
  aggiornamento: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-slate-200 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-notte dark:text-white text-sm font-semibold pl-2.5 pr-3.5 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Torna Indietro
          </Link>
          <Link href="/" className="flex items-center gap-2 ml-auto shrink-0" aria-label="Home">
            <LogoUfficiale dimensione={34} />
            <span className="hidden sm:block font-bold text-notte dark:text-white leading-[1.05] text-[13px]">
              Fisioterapista
              <br />
              <span className="text-primary-600 dark:text-primary-400">Domiciliare</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-notte dark:text-white mb-2">
          {titolo}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Ultimo aggiornamento: {aggiornamento}
        </p>

        <div className="rc-legale text-slate-700 dark:text-slate-300">{children}</div>

        <p className="mt-12 pt-6 border-t border-slate-200 dark:border-gray-800 text-sm text-slate-500 dark:text-slate-400">
          Per qualsiasi domanda scrivi a{" "}
          <a
            href="mailto:fisioterapistadomiciliare.info@gmail.com"
            className="text-primary-600 dark:text-primary-400 font-medium underline underline-offset-2"
          >
            fisioterapistadomiciliare.info@gmail.com
          </a>
          .
        </p>
      </main>
    </div>
  );
}
