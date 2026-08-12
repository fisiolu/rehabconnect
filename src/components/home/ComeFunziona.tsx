import { Crosshair, Map, PhoneCall } from "lucide-react";
import Rivela from "@/components/Rivela";

const passi = [
  {
    numero: "1",
    icon: Crosshair,
    titolo: "Dici dove sei",
    testo:
      "Premi un pulsante e l'app rileva la tua posizione. Altrimenti scegli semplicemente la tua città.",
  },
  {
    numero: "2",
    icon: Map,
    titolo: "Vedi chi c'è vicino",
    testo:
      "Sulla mappa compaiono i Fisioterapisti della tua zona, ciascuno con la distanza da casa tua e le sue specialità.",
  },
  {
    numero: "3",
    icon: PhoneCall,
    titolo: "Lo contatti direttamente",
    testo:
      "Apri la scheda, controlli esperienza e valutazioni e lo chiami. Senza attesa e senza passaparola.",
  },
];

export default function ComeFunziona() {
  return (
    <section
      id="come-funziona"
      className="py-16 sm:py-24 bg-white dark:bg-gray-900"
      aria-labelledby="come-funziona-titolo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Rivela className="text-center max-w-2xl mx-auto mb-14">
          <h2
            id="come-funziona-titolo"
            className="text-3xl sm:text-4xl font-bold text-notte dark:text-white mb-4"
          >
            Tre passaggi, un minuto
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Non serve registrarsi. Apri, cerca, e vedi subito il Fisioterapista che lavora
            vicino a casa tua.
          </p>
        </Rivela>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {passi.map((p, i) => (
            <Rivela key={p.numero} come="li" className="relative" ritardo={i * 120}>
              <div className="flex items-center gap-4 mb-4">
                <span className="relative w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <p.icon size={24} aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {p.numero}
                  </span>
                </span>
                <h3 className="text-xl font-bold text-notte dark:text-white">{p.titolo}</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{p.testo}</p>
            </Rivela>
          ))}
        </ol>
      </div>
    </section>
  );
}
