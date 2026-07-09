import { ClipboardCheck, UserCheck, CalendarCheck, Wifi } from "lucide-react";
import { IconaPazienteSediaARotelle, IconaFisioterapista } from "@/components/IconeRuolo";

function SchedaFloat({
  icon: Icon,
  testo,
  className = "",
  accento,
}: {
  icon: typeof ClipboardCheck;
  testo: string;
  className?: string;
  accento: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 bg-white rounded-xl shadow-lg border border-slate-100 px-3.5 py-2.5 max-w-[180px] sm:max-w-[200px] ${className}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accento}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="text-xs font-semibold text-notte leading-snug">{testo}</span>
    </div>
  );
}

export default function HeroIllustrazione() {
  return (
    <div className="relative mx-auto max-w-md md:max-w-none" aria-hidden="true">
      <div className="rounded-3xl bg-gradient-to-br from-primary-50 via-sfondo to-teal-50 p-8 sm:p-10 relative overflow-hidden border border-slate-100">
        {/* decorazione di sfondo */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-teal-100/60 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-100/60 blur-2xl" />

        <div className="relative flex items-end justify-center gap-5 sm:gap-8 py-6">
          <IconaPazienteSediaARotelle className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-sm" />

          {/* collegamento digitale */}
          <div className="flex flex-col items-center gap-1.5 mb-10 sm:mb-12">
            <Wifi className="text-teal-500 w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>

          <IconaFisioterapista className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-sm" />
        </div>
      </div>

      <SchedaFloat
        icon={ClipboardCheck}
        testo="Richiesta presa in carico"
        accento="bg-teal-50 text-teal-600"
        className="-top-4 -left-3 sm:-left-8 sm:-top-6"
      />
      <SchedaFloat
        icon={UserCheck}
        testo="Fisioterapista disponibile"
        accento="bg-primary-50 text-primary-600"
        className="top-1/2 -right-3 sm:-right-10 -translate-y-1/2"
      />
      <SchedaFloat
        icon={CalendarCheck}
        testo="Appuntamento confermato"
        accento="bg-notte/10 text-notte"
        className="-bottom-4 left-6 sm:left-10 sm:-bottom-6"
      />
    </div>
  );
}
