"use client";

import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";
import { pazienti, medici, fisioterapisti } from "@/lib/demoData";
import Link from "next/link";
import { Accessibility, Stethoscope, Dumbbell, MapPin } from "lucide-react";
import HeaderHome from "@/components/home/HeaderHome";
import HeroIllustrazione from "@/components/home/HeroIllustrazione";
import PercorsoCard from "@/components/home/PercorsoCard";
import ComeFunziona from "@/components/home/ComeFunziona";
import FooterHome from "@/components/home/FooterHome";

function getUtenteDemo(ruolo: string) {
  if (ruolo === "paziente") {
    const p = pazienti[0];
    return { ruolo: "paziente" as const, id: p.id, nome: `${p.nome} ${p.cognome}` };
  }
  if (ruolo === "medico") {
    const m = medici[0];
    return { ruolo: "medico" as const, id: m.id, nome: `Dr.ssa ${m.cognome}` };
  }
  if (ruolo === "fisioterapista") {
    const f = fisioterapisti[0];
    return { ruolo: "fisioterapista" as const, id: f.id, nome: `${f.nome} ${f.cognome}` };
  }
  return { ruolo: "admin" as const, id: "admin-001", nome: "Amministratore" };
}

export default function HomePage() {
  const { setUtente } = useApp();
  const router = useRouter();

  function accedi(ruolo: string) {
    const utente = getUtenteDemo(ruolo);
    setUtente(utente);
    router.push(`/dashboard/${ruolo}`);
  }

  return (
    <div className="min-h-screen bg-sfondo dark:bg-gray-900">
      <HeaderHome />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-28 grid md:grid-cols-2 gap-16 md:gap-12 items-center">
        <div>
          <span className="inline-flex items-center bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5 border border-amber-200 dark:border-amber-800">
            Versione dimostrativa · Nessun dato sanitario reale
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-notte dark:text-white leading-tight mb-5">
            La riabilitazione domiciliare, finalmente connessa.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
            RehabConnect mette in contatto pazienti, medici, centri di assistenza e
            fisioterapisti qualificati, semplificando la presa in carico e
            l&apos;organizzazione degli interventi domiciliari.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/trova"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <MapPin size={18} aria-hidden="true" />
              Trova un fisioterapista vicino a te
            </Link>
            <a
              href="#percorsi"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-notte dark:text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Sei un professionista?
            </a>
          </div>
        </div>

        <HeroIllustrazione />
      </section>

      {/* Scegli il tuo percorso */}
      <section
        id="percorsi"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
        aria-labelledby="percorsi-titolo"
      >
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 id="percorsi-titolo" className="text-2xl sm:text-3xl font-bold text-notte dark:text-white mb-3">
            Scegli il tuo percorso
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Accedi all&apos;area dedicata al tuo ruolo per iniziare.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <PercorsoCard
            icon={Accessibility}
            titolo="Paziente"
            sottotitolo="o familiare"
            descrizione="Richiedi assistenza riabilitativa e monitora lo stato della tua presa in carico."
            ctaLabel="Accedi come paziente"
            onClick={() => accedi("paziente")}
            iconBg="bg-primary-50 dark:bg-primary-900/30"
            iconColor="text-primary-600 dark:text-primary-400"
            ring="focus-visible:ring-primary-500"
          />
          <PercorsoCard
            icon={Stethoscope}
            titolo="Medico"
            sottotitolo="o centro"
            descrizione="Valuta le richieste in arrivo e assegna i fisioterapisti più adatti."
            ctaLabel="Accedi come medico"
            onClick={() => accedi("medico")}
            iconBg="bg-teal-50 dark:bg-teal-900/30"
            iconColor="text-teal-600 dark:text-teal-400"
            ring="focus-visible:ring-teal-500"
          />
          <PercorsoCard
            icon={Dumbbell}
            titolo="Fisioterapista"
            descrizione="Gestisci gli incarichi assegnati e la tua agenda settimanale."
            ctaLabel="Accedi come fisioterapista"
            onClick={() => accedi("fisioterapista")}
            iconBg="bg-notte/10 dark:bg-white/10"
            iconColor="text-notte dark:text-slate-200"
            ring="focus-visible:ring-notte"
          />
        </div>
      </section>

      <ComeFunziona />

      <FooterHome onAdminClick={() => accedi("admin")} />
    </div>
  );
}
