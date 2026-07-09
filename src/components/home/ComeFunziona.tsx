import { FileText, Stethoscope, HeartHandshake } from "lucide-react";

const passi = [
  {
    numero: "01",
    icon: FileText,
    titolo: "Il paziente invia la richiesta",
    testo: "Compila una richiesta descrivendo il bisogno riabilitativo, in pochi minuti e senza spostarsi da casa.",
  },
  {
    numero: "02",
    icon: Stethoscope,
    titolo: "Il medico o il centro la valuta",
    testo: "Il medico di riferimento valuta la richiesta e individua il fisioterapista più adatto al percorso.",
  },
  {
    numero: "03",
    icon: HeartHandshake,
    titolo: "Il fisioterapista prende in carico l'intervento",
    testo: "Il fisioterapista accetta l'incarico, pianifica gli appuntamenti e segue il percorso fino al completamento.",
  },
];

export default function ComeFunziona() {
  return (
    <section
      id="come-funziona"
      className="py-16 sm:py-20 bg-white dark:bg-gray-900"
      aria-labelledby="come-funziona-titolo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="come-funziona-titolo" className="text-2xl sm:text-3xl font-bold text-notte dark:text-white mb-3">
            Come funziona
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Tre passaggi semplici per attivare un percorso di riabilitazione domiciliare.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          {passi.map((p) => (
            <li key={p.numero} className="text-center sm:text-left">
              <div className="flex sm:flex-col items-center sm:items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <p.icon size={26} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-teal-500 tracking-wide">
                    PASSO {p.numero}
                  </span>
                  <h3 className="font-bold text-notte dark:text-white mt-1">{p.titolo}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 sm:pl-[4.5rem] leading-relaxed">
                {p.testo}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
