import { BadgeCheck, Home, MessageSquareHeart, Route } from "lucide-react";
import Rivela from "@/components/Rivela";

const motivi = [
  {
    icon: BadgeCheck,
    titolo: "Professionisti verificati",
    testo:
      "Ogni fisioterapista dichiara il proprio numero di iscrizione all'albo, controllato prima della pubblicazione del profilo.",
  },
  {
    icon: Route,
    titolo: "Zona di lavoro dichiarata",
    testo:
      "Sai in anticipo fin dove ciascun professionista si sposta, così non perdi tempo a chiamare chi non arriva da te.",
  },
  {
    icon: MessageSquareHeart,
    titolo: "Specialità in chiaro",
    testo:
      "Ortopedica, neurologica, respiratoria, geriatrica: scegli chi si occupa davvero del tuo problema, non il primo nome disponibile.",
  },
  {
    icon: Home,
    titolo: "A casa tua",
    testo:
      "Nessuno spostamento, nessuna sala d'attesa. La riabilitazione arriva dove ti trovi, negli orari che concordate.",
  },
];

export default function PercheFidarsi() {
  return (
    <section
      className="py-16 sm:py-24 bg-sfondo dark:bg-gray-900/50"
      aria-labelledby="fiducia-titolo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Rivela className="text-center max-w-2xl mx-auto mb-12">
          <h2
            id="fiducia-titolo"
            className="text-3xl sm:text-4xl font-bold text-notte dark:text-white mb-4"
          >
            Perché fidarsi di chi trovi qui
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Affidare un familiare a un professionista è una scelta delicata. Ti diamo gli elementi
            per farla con serenità.
          </p>
        </Rivela>

        <div className="grid sm:grid-cols-2 gap-5">
          {motivi.map((m, i) => (
            <Rivela
              key={m.titolo}
              ritardo={i * 100}
              className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 sm:p-6"
            >
              <span className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <m.icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold text-notte dark:text-white mb-1.5">{m.titolo}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {m.testo}
                </p>
              </div>
            </Rivela>
          ))}
        </div>
      </div>
    </section>
  );
}
