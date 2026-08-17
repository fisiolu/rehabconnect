"use client";

import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import { medici } from "@/lib/demoData";
import { Accessibility, ArrowRight, HandHelping, MapPin, Stethoscope } from "lucide-react";
import HeaderHome from "@/components/home/HeaderHome";
import AnteprimaMappa from "@/components/home/AnteprimaMappa";
import ComeFunziona from "@/components/home/ComeFunziona";
import PercheFidarsi from "@/components/home/PercheFidarsi";
import PercorsoCard from "@/components/home/PercorsoCard";
import FooterHome from "@/components/home/FooterHome";
import Rivela from "@/components/Rivela";

export default function HomePage() {
  const { entraComeMedicoDemo } = useApp();
  const router = useRouter();

  /**
   * Paziente e Fisioterapista hanno ormai un account vero: la card manda
   * al login, che a sua volta offre la registrazione.
   * Il Medico resta provvisoriamente a un ingresso demo (nessun account
   * reale ancora — arriverà in un passaggio successivo).
   */
  function accediComeMedicoDemo() {
    const m = medici[0];
    entraComeMedicoDemo({ ruolo: "medico", id: m.id, nome: `Dr.ssa ${m.cognome}` });
    router.push("/dashboard/medico");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeaderHome />

      {/* ---------- Apertura ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sfondo to-white dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 grid lg:grid-cols-2 gap-14 lg:gap-12 items-center">
          <div>
            <Rivela>
              <span className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-teal-200 dark:border-teal-800">
                <MapPin size={15} aria-hidden="true" />
                In tutta Italia
              </span>
            </Rivela>

            <Rivela ritardo={90}>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-notte dark:text-white leading-[1.08] tracking-tight mb-6">
                Il Fisioterapista{" "}
                <br />
                <span className="text-primary-600 dark:text-primary-400">a casa tua</span>, vicino
                davvero.
              </h1>
            </Rivela>

            <Rivela ritardo={180}>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-9 max-w-xl">
                Apri l&apos;app e vedi subito quali Fisioterapisti lavorano nella tua zona, cosa
                trattano e quanto sono lontani da casa tua. Poi li chiami direttamente.
              </p>
            </Rivela>

            <Rivela ritardo={270} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/trova"
                className="inline-flex items-center justify-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg px-7 py-4 rounded-2xl transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <MapPin size={21} aria-hidden="true" />
                Cerca vicino a me
              </Link>
              <a
                href="#come-funziona"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 text-notte dark:text-white font-semibold text-lg px-7 py-4 rounded-2xl border border-slate-200 dark:border-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Come funziona
              </a>
            </Rivela>
          </div>

          <Rivela ritardo={200} className="lg:pl-4">
            <div className="rc-galleggia">
              <AnteprimaMappa />
            </div>
          </Rivela>
        </div>
      </section>

      <ComeFunziona />

      <PercheFidarsi />

      {/* ---------- Richiamo finale ---------- */}
      <section className="py-16 sm:py-20 bg-notte">
        <Rivela className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Hai bisogno del Fisioterapista a domicilio?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Bastano pochi secondi per scoprire chi lavora nella tua zona.
          </p>
          <Link
            href="/trova"
            className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-notte font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-notte"
          >
            <MapPin size={21} aria-hidden="true" />
            Cerca vicino a me
          </Link>
        </Rivela>
      </section>

      {/* ---------- Aree riservate ---------- */}
      <section
        id="percorsi"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
        aria-labelledby="percorsi-titolo"
      >
        <Rivela className="text-center max-w-xl mx-auto mb-10">
          <h2
            id="percorsi-titolo"
            className="text-2xl sm:text-3xl font-bold text-notte dark:text-white mb-3"
          >
            Aree riservate
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Entra nella tua area.</p>
        </Rivela>

        <div className="grid sm:grid-cols-3 gap-5">
          <Rivela className="h-full">
            <PercorsoCard
              icon={Accessibility}
              titolo="Paziente"
              sottotitolo="o familiare"
              descrizione="Segui il tuo percorso, gli appuntamenti e i messaggi con il Fisioterapista."
              ctaLabel="Entra come paziente"
              onClick={() => router.push("/accedi")}
              iconBg="bg-primary-50 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
              ring="focus-visible:ring-primary-500"
            />
          </Rivela>
          {/* Il Fisioterapista sta in mezzo: è l'altra metà dell'incontro che
              la piattaforma serve. Il medico viene dopo, perché nel percorso
              è di supporto e non passaggio obbligato. */}
          <Rivela className="h-full" ritardo={110}>
            <PercorsoCard
              icon={HandHelping}
              titolo="Fisioterapista"
              descrizione="Fatti trovare dai pazienti della tua zona e gestisci la tua agenda."
              ctaLabel="Entra come Fisioterapista"
              onClick={() => router.push("/accedi")}
              iconBg="bg-notte/10 dark:bg-white/10"
              iconColor="text-notte dark:text-slate-200"
              ring="focus-visible:ring-notte"
            />
          </Rivela>
          <Rivela className="h-full" ritardo={220}>
            <PercorsoCard
              icon={Stethoscope}
              titolo="Medico"
              sottotitolo="di base/Specialista"
              descrizione="Valuta le richieste dei tuoi assistiti e indirizzali al professionista giusto."
              ctaLabel="Entra come medico"
              onClick={accediComeMedicoDemo}
              iconBg="bg-teal-50 dark:bg-teal-900/30"
              iconColor="text-teal-600 dark:text-teal-400"
              ring="focus-visible:ring-teal-500"
            />
          </Rivela>
        </div>

        <p className="text-center mt-8">
          <Link
            href="/trova"
            className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold hover:gap-2.5 transition-all rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Oppure cerca un Fisioterapista senza registrarti
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </p>
      </section>

      <FooterHome onAdminClick={() => router.push("/accedi")} />
    </div>
  );
}
