import { ArrowRight, type LucideIcon } from "lucide-react";

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
}: PercorsoCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group text-left w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${ring} focus-visible:ring-offset-2`}
    >
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
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2.5 transition-all">
        {ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
