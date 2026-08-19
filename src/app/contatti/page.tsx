import type { Metadata } from "next";
import Link from "next/link";
import PaginaLegale from "@/components/PaginaLegale";

export const metadata: Metadata = {
  title: "Contatti — Fisioterapista Domiciliare",
  description:
    "Come scrivere a Fisioterapista Domiciliare per informazioni, segnalazioni o richieste sui tuoi dati.",
};

export default function ContattiPage() {
  return (
    <PaginaLegale titolo="Contatti" aggiornamento="agosto 2026">
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 mb-8">
        <p className="font-semibold text-red-900 dark:text-red-300">
          Questo non è un canale di emergenza
        </p>
        <p className="text-red-800 dark:text-red-200 text-sm mt-1">
          Nessuno legge questa casella in tempo reale. Per un malore, una caduta, un dolore
          improvviso e forte, chiama il <strong>112</strong> o rivolgiti al pronto soccorso.
        </p>
      </div>

      <h2>Chi c&apos;è dietro</h2>
      <p>
        &laquo;Fisioterapista Domiciliare&raquo; è un progetto informativo curato da{" "}
        <strong>Luciano Simione</strong>, fisioterapista, iscritto all&apos;Ordine dei
        Fisioterapisti della Regione Lazio con il numero <strong>1301</strong>.
      </p>
      <p>
        È un progetto a carattere informativo: non è una società, una clinica né una struttura
        sanitaria.
      </p>

      <h2>Come scrivere</h2>
      <p>
        Un solo indirizzo, per tutto:{" "}
        <a href="mailto:fisioterapistadomiciliare.info@gmail.com">
          fisioterapistadomiciliare.info@gmail.com
        </a>
      </p>
      <p>Va bene per:</p>
      <ul>
        <li>informazioni su come funziona la piattaforma;</li>
        <li>problemi tecnici o cose che non funzionano;</li>
        <li>segnalare un profilo che ti sembra sospetto;</li>
        <li>
          richieste sui tuoi dati personali — accesso, correzione, cancellazione dell&apos;account:
          vedi l&apos;<Link href="/privacy">informativa privacy</Link>.
        </li>
      </ul>

      <h2>Quando aspettarsi risposta</h2>
      <p>
        Di norma entro pochi giorni lavorativi. Non posso promettere tempi certi, ma le richieste
        sui dati personali hanno la precedenza, come la legge richiede.
      </p>

      <h2>Cosa non posso fare da qui</h2>
      <ul>
        <li>
          <strong>Dare pareri clinici.</strong> Non posso dire cosa hai o cosa devi fare per un
          dolore: serve una valutazione di persona, dal tuo medico o da un fisioterapista.
        </li>
        <li>
          <strong>Fissare appuntamenti per conto di altri.</strong> Gli appuntamenti si concordano
          direttamente con il professionista che scegli.
        </li>
        <li>
          <strong>Intervenire nei rapporti economici.</strong> La piattaforma non incassa denaro e
          non entra nei pagamenti fra te e il professionista.
        </li>
      </ul>

      <h2>Se cerchi un fisioterapista</h2>
      <p>
        Non serve scrivermi: puoi <Link href="/trova">cercare direttamente nella tua zona</Link> e
        contattare il professionista che preferisci.
      </p>
    </PaginaLegale>
  );
}
