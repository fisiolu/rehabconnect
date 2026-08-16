import type { Metadata } from "next";
import PaginaLegale from "@/components/PaginaLegale";

export const metadata: Metadata = {
  title: "Informativa privacy — Fisioterapista Domiciliare",
  description:
    "Quali dati tratta l'applicazione Fisioterapista Domiciliare, dove finiscono e quali diritti hai.",
};

export default function PrivacyPage() {
  return (
    <PaginaLegale titolo="Informativa privacy" aggiornamento="agosto 2026">
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 mb-8">
        <p className="font-semibold text-amber-900 dark:text-amber-300">
          Questa è una versione dimostrativa
        </p>
        <p className="text-amber-800 dark:text-amber-200 text-sm mt-1">
          Non ci sono utenti registrati, non esiste un archivio e i nomi che vedi sono inventati.
          Non inserire dati veri di persone vere, né tuoi né di altri.
        </p>
      </div>

      <h2>Chi tratta i dati</h2>
      <p>
        Il titolare del trattamento è il gestore di &laquo;Fisioterapista Domiciliare&raquo;,
        raggiungibile a <a href="mailto:fisioterapistadomiciliare.info@gmail.com">fisioterapistadomiciliare.info@gmail.com</a>.
      </p>

      <h2>Che cosa questa applicazione non fa</h2>
      <ul>
        <li>Non ha registrazione, account o password.</li>
        <li>Non ha un archivio: nessun dato viene conservato su un server.</li>
        <li>Non conserva dati sanitari.</li>
        <li>Non usa cookie di profilazione, statistiche o strumenti pubblicitari.</li>
        <li>Non vende né cede dati a nessuno.</li>
      </ul>

      <h2>Che cosa succede, punto per punto</h2>

      <h3>La tua posizione</h3>
      <p>
        Se premi &laquo;Usa la mia posizione&raquo;, il browser ti chiede il permesso e le
        coordinate restano <strong>dentro il tuo dispositivo</strong>: servono solo a calcolare la
        distanza dai Fisioterapisti. Non ce le mandi e non le conserviamo. Puoi rifiutare il
        permesso e cercare scrivendo il nome del tuo comune.
      </p>

      <h3>L&apos;indirizzo che scrivi nella ricerca</h3>
      <p>
        Quando premi &laquo;Cerca&raquo;, il testo che hai scritto viene inviato al nostro server e
        da lì a <strong>Nominatim</strong>, il servizio di ricerca di OpenStreetMap, che lo
        trasforma in coordinate. È l&apos;unico modo per far funzionare la ricerca per nome. Il
        testo viene inviato <strong>solo quando premi Cerca</strong>, mai mentre stai ancora
        scrivendo. Non lo conserviamo: teniamo per un breve periodo solo il risultato della
        ricerca, per non ripetere la stessa domanda.
      </p>

      <h3>La mappa</h3>
      <p>
        Le mappe arrivano dai server di <strong>OpenStreetMap</strong>. Come accade con qualunque
        immagine caricata da internet, quei server vedono il tuo indirizzo IP e la zona che stai
        guardando. È il funzionamento normale di una mappa online.
      </p>

      <h3>I messaggi</h3>
      <p>
        I messaggi che scrivi vivono <strong>solo nella memoria del browser</strong> e spariscono
        quando ricarichi la pagina. Non passano da nessun server e non sono leggibili da noi.
      </p>

      <h3>La dettatura vocale</h3>
      <p>
        Il microfono usa il riconoscimento vocale <strong>del browser che stai usando</strong>, non
        un servizio nostro: l&apos;audio non passa dai nostri server. Va però detto con chiarezza
        che alcuni browser — Chrome fra questi — elaborano la voce sui propri server esterni. Se
        preferisci evitarlo, non usare il microfono e scrivi a mano: il risultato è identico.
      </p>

      <h3>Le preferenze</h3>
      <p>
        Nel tuo browser vengono salvate tre impostazioni: tema chiaro o scuro, dimensione del
        testo, e il promemoria degli auguri di compleanno già mostrato. Servono solo a non
        richiedertele ogni volta e si cancellano svuotando i dati del sito.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi esercitare i diritti previsti dagli articoli 15-22 del Regolamento europeo 2016/679:
        accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Poiché in questa
        versione non conserviamo alcun dato, in pratica non c&apos;è nulla da cancellare; per ogni
        richiesta scrivi comunque a <a href="mailto:fisioterapistadomiciliare.info@gmail.com">fisioterapistadomiciliare.info@gmail.com</a>.
      </p>
      <p>
        Hai inoltre diritto di proporre reclamo al{" "}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
          Garante per la Protezione dei Dati Personali
        </a>
        .
      </p>

      <h2>Quando l&apos;applicazione sarà usata davvero</h2>
      <p>
        Nel momento in cui tratterà dati di pazienti reali, questa informativa non basterà più:
        andranno indicati archivio e responsabili, tempi di conservazione, misure di sicurezza e
        le regole più severe che il Regolamento riserva ai dati sulla salute. Questo testo
        descrive fedelmente la versione dimostrativa e non sostituisce il parere di un
        professionista.
      </p>
    </PaginaLegale>
  );
}
