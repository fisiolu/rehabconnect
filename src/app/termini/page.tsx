import type { Metadata } from "next";
import PaginaLegale from "@/components/PaginaLegale";

export const metadata: Metadata = {
  title: "Termini di servizio — Fisioterapista Domiciliare",
  description:
    "Che cos'è e che cosa non è la piattaforma Fisioterapista Domiciliare, e a quali condizioni si usa.",
};

export default function TerminiPage() {
  return (
    <PaginaLegale titolo="Termini di servizio" aggiornamento="agosto 2026">
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 mb-8">
        <p className="font-semibold text-red-900 dark:text-red-300">
          In caso di emergenza chiama il 112
        </p>
        <p className="text-red-800 dark:text-red-200 text-sm mt-1">
          Questa piattaforma non è un servizio di urgenza e nessuno la sorveglia in tempo reale.
          Per un malore, una caduta o un dolore improvviso e forte, chiama il numero unico di
          emergenza 112 o rivolgiti al pronto soccorso.
        </p>
      </div>

      <h2>Che cos&apos;è questa piattaforma</h2>
      <p>
        &laquo;Fisioterapista Domiciliare&raquo; mette in contatto chi cerca fisioterapia a
        domicilio con i professionisti che lavorano nella sua zona. Mostra chi c&apos;è, a che
        distanza, con quali specialità, e permette di scrivergli.
      </p>

      <h2>Che cosa non è</h2>
      <ul>
        <li>
          <strong>Non è una struttura sanitaria</strong> e non eroga prestazioni. Il rapporto di
          cura si instaura direttamente fra paziente e Fisioterapista.
        </li>
        <li>
          <strong>Non dà consigli medici.</strong> Nulla di quanto leggi qui sostituisce una
          visita o il parere del tuo medico.
        </li>
        <li>
          <strong>Non è un servizio di emergenza</strong>, come detto qui sopra.
        </li>
        <li>
          <strong>Non impiega i professionisti</strong> che vi compaiono: sono liberi
          professionisti autonomi.
        </li>
      </ul>

      <h2>Il trattamento è privato</h2>
      <p>
        Non esiste convenzione diretta fra fisioterapista e ASL: la prestazione a domicilio è
        sempre <strong>privata</strong>. La tariffa è stabilita da ciascun professionista, indicata
        nella sua scheda a titolo orientativo, e va concordata direttamente con lui: dipende dal
        tipo di trattamento. Alcuni professionisti lavorano con assicurazioni o fondi sanitari, e
        lo dichiarano nella propria scheda.
      </p>
      <p>
        La piattaforma non incassa denaro, non trattiene commissioni e non interviene nei
        pagamenti.
      </p>

      <h2>Prima di iniziare</h2>
      <p>
        Rivolgersi direttamente a un fisioterapista è possibile. È però preferibile sapere se il
        proprio medico ha dato indicazioni o prescrizioni sulla fisioterapia: portale al primo
        incontro, aiutano a impostare il percorso giusto.
      </p>

      <h2>I professionisti e l&apos;albo</h2>
      <p>
        Ogni professionista dichiara il proprio numero di iscrizione all&apos;Ordine dei
        Fisioterapisti. Il numero è mostrato nella scheda e puoi verificarlo tu stesso sull&apos;
        <a
          href="https://fisionet.fnofi.it/albo-professionale"
          target="_blank"
          rel="noopener noreferrer"
        >
          albo pubblico della FNOFI
        </a>
        . Responsabilità dell&apos;esercizio della professione, delle prestazioni e degli obblighi
        di legge restano interamente del singolo professionista.
      </p>

      <h2>Come comportarsi</h2>
      <p>
        Usa la messaggistica per organizzare l&apos;assistenza. Non scrivere insulti, non
        molestare, non inserire dati di altre persone senza il loro consenso, e non usare la
        piattaforma per scopi diversi da quello per cui esiste.
      </p>

      <h2>Legge applicabile</h2>
      <p>
        Si applica la legge italiana. Per il trattamento dei dati vedi l&apos;
        <a href="/privacy">informativa privacy</a>.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Questo testo non sostituisce il parere di un legale.
      </p>
    </PaginaLegale>
  );
}
