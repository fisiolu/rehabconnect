import { ArrowRight, FlaskConical, type LucideIcon } from "lucide-react";

interface PercorsoCardProps {
  icon: LucideIcon;
  titolo: string;
  sottotitolo?: string;
  descrizione: string;
  ctaLabel: string;
  onClick: () => void;
  iconBg: string;
  iconColor: string;
  ring: string;
  /**
   * Pulsante secondario opzionale (oggi solo per il Medico, che non ha
   * ancora una dashboard vera ma conserva quella dimostrativa). Per
   * questo la card non è più un solo <button>: due azioni cliccabili non
   * possono annidarsi, quindi il contenitore è un <div> e ciascuna azione
   * ha il proprio elemento interattivo.
   */
  azioneExtra?: { label: string; onClick: () => void };
}

export default function PercorsoCard({
  icon: Icon,
  titolo,
  sottotitolo,
  descrizione,
  ctaLabel,
  onClick,
  iconBg,
  iconColor,
  ring,
  azioneExtra,
}: PercorsoCardProps) {
  return (
    <div className="group text-left w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}
      >
        <Icon className={iconColor} size={24} strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-notte dark:text-white mb-1">
        {titolo}
        {sottotitolo && (
          <>
            {" "}
            <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">
              {sottotitolo}
            </span>
          </>
        )}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        {descrizione}
      </p>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all rounded focus-visible:outline-none focus-visible:ring-2 ${ring} focus-visible:ring-offset-2`}
      >
        {ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </button>
      {azioneExtra && (
        <button
          onClick={azioneExtra.onClick}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          <FlaskConical size={13} aria-hidden="true" />
          {azioneExtra.label}
        </button>
      )}
    </div>
  );
}
