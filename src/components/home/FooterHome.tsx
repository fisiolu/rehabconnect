import { ShieldCheck } from "lucide-react";

interface FooterHomeProps {
  onAdminClick: () => void;
}

export default function FooterHome({ onAdminClick }: FooterHomeProps) {
  return (
    <footer id="sicurezza" className="bg-notte text-slate-300 py-12" aria-label="Footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-bold text-white mb-3">
              <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="18" cy="18" r="3" />
                  <path d="M8.5 8.5l7 7" />
                </svg>
              </span>
              RehabConnect
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La piattaforma che connette pazienti, medici e fisioterapisti per la
              riabilitazione domiciliare.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  Termini di servizio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contatti</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@rehabconnect.demo" className="hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
                  info@rehabconnect.demo
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
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} RehabConnect</p>
        </div>
      </div>
    </footer>
  );
}
