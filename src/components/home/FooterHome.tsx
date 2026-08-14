import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import LogoUfficiale from "@/components/LogoUfficiale";

interface FooterHomeProps {
  onAdminClick: () => void;
}

export default function FooterHome({ onAdminClick }: FooterHomeProps) {
  return (
    <footer id="sicurezza" className="bg-notte text-slate-300 py-12" aria-label="Footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-white mb-3">
              <span className="rounded-lg bg-white/95 p-0.5 shrink-0">
                <LogoUfficiale dimensione={38} />
              </span>
              <span className="leading-[1.05]">
                Fisioterapista
                <br />
                Domiciliare
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La piattaforma che connette pazienti e Fisioterapisti per un servizio domiciliare.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/termini" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  Termini di servizio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contatti</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@fisioterapista-domiciliare.demo" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  info@fisioterapista-domiciliare.demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Amministrazione</h4>
            <button
              onClick={onAdminClick}
              className="text-sm text-slate-300 hover:text-white transition-colors underline-offset-2 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              Accesso amministratore
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck size={14} aria-hidden="true" className="shrink-0" />
            Versione dimostrativa — nessun dato sanitario reale, nessun servizio a pagamento
          </p>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Fisioterapista Domiciliare</p>
        </div>
      </div>
    </footer>
  );
}
