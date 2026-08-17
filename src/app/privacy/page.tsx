import type { Metadata } from "next";
import PaginaLegale from "@/components/PaginaLegale";

export const metadata: Metadata = {
  title: "Informativa privacy — Fisioterapista Domiciliare",
  description:
    "Quali dati raccoglie l'app Fisioterapista Domiciliare, dove finiscono, con chi vengono condivisi e quali diritti hai.",
};

export default function PrivacyPage() {
  return (
    <PaginaLegale titolo="Informativa privacy" aggiornamento="agosto 2026">
      <p>
        Questa informativa spiega, ai sensi degli articoli 13 e 14 del Regolamento europeo
        2016/679 (GDPR), quali dati personali tratta &laquo;Fisioterapista Domiciliare&raquo;
        quando cerchi un professionista, ti registri come paziente o come fisioterapista, o usi la
        messaggistica diretta.
      </p>

      <h2>Chi tratta i dati</h2>
      <p>
        Il titolare del trattamento è il gestore di &laquo;Fisioterapista Domiciliare&raquo;,
        raggiungibile a{" "}
        <a href="mailto:fisioterapistadomiciliare.info@gmail.com">
          fisioterapistadomiciliare.info@gmail.com
        </a>
        .
      </p>

      <h2>Quali dati raccogliamo e perché</h2>

      <h3>Se ti registri come paziente</h3>
      <p>
        Nome, cognome, telefono, email, l&apos;indirizzo di casa che scrivi in fase di
        registrazione e le coordinate che ne derivano. Servono a creare il tuo account, a
        mostrarti i Fisioterapisti vicini e a farti trovare da chi ti risponde in chat. La base
        giuridica è l&apos;esecuzione del contratto che accetti registrandoti (art. 6.1.b GDPR):
        senza questi dati il servizio non può funzionare. Non ti chiediamo data di nascita né
        codice fiscale: non ci servono per farti incontrare un professionista vicino, e chiederteli
        senza usarli sarebbe solo un rischio di sicurezza in più a carico tuo.
      </p>
      <p>
        Se salvi la scheda del tuo medico di riferimento (nome, ambulatorio, telefono, orari),
        quei dati restano visibili solo a te: servono a tenerli a portata di mano, non li
        condividiamo con nessuno. Sono dati di una terza persona che inserisci tu: assicurati di
        poterli condividere legittimamente.
      </p>

      <h3>Se ti registri come fisioterapista</h3>
      <p>
        Nome, cognome, telefono, email, numero di iscrizione all&apos;Ordine, PEC, specializzazioni,
        tariffe, assicurazioni con cui lavori, zona e raggio di spostamento, anni di esperienza e
        presentazione. Servono a costruire la tua scheda pubblica e a permettere all&apos;amministratore
        di verificare la tua identità prima di approvarti (confrontando numero d&apos;albo e PEC con i
        registri pubblici dell&apos;Ordine) — anche qui, base giuridica l&apos;esecuzione del
        contratto. La PEC non è mai mostrata ai pazienti: la vede solo chi approva le iscrizioni,
        per il solo scopo della verifica.
      </p>
      <p>
        Finché la scheda è in attesa di approvazione o viene rifiutata, resta visibile solo a te e
        all&apos;amministratore. Una volta approvata, chi cerca senza aver fatto accesso vede nome,
        specializzazioni, tariffa, presentazione e le altre informazioni professionali, ma{" "}
        <strong>non il cognome, il telefono, l&apos;email o la foto</strong>: questi compaiono solo
        a chi si è registrato e ha effettuato l&apos;accesso.
      </p>
      <p>
        La <strong>foto è facoltativa</strong>: puoi non metterla, cambiarla o toglierla quando
        vuoi dalla tua area, e togliendola il file viene cancellato. È conservata in un archivio
        chiuso: non ha un indirizzo web pubblico, e viene mostrata solo attraverso un collegamento
        temporaneo che il sistema rilascia unicamente a chi ha effettuato l&apos;accesso. Metti una
        foto in cui compari tu: non caricare immagini di altre persone.
      </p>

      <h3>Se cerchi senza esserti registrato</h3>
      <p>
        Non ti chiediamo nulla per usare la ricerca. Se premi &laquo;Usa la mia posizione&raquo;, il
        browser ti chiede il permesso e le coordinate restano <strong>dentro il tuo
        dispositivo</strong>: servono solo a calcolare la distanza dai Fisioterapisti, non ce le
        mandi e non le conserviamo. Se scrivi un luogo a mano, il testo viene inviato al nostro
        server e da lì a Nominatim (vedi sotto) solo quando premi &laquo;Cerca&raquo;, mai mentre
        stai ancora scrivendo.
      </p>

      <h3>I messaggi</h3>
      <p>
        Una conversazione fra te e un Fisioterapista nasce solo quando scrivi da una scheda trovata
        in ricerca, e nasce fra voi due soltanto. I messaggi sono conservati sui nostri server (non
        più solo nel browser) perché tu possa ritrovarli tornando sull&apos;app: li può leggere solo
        chi partecipa alla conversazione, verificato ad ogni richiesta dal database, non
        dall&apos;interfaccia. Se scrivi informazioni sulla tua salute in un messaggio, la
        trattiamo con la stessa riservatezza di ogni altro dato che ci affidi, ma ricorda che è una
        chat, non una cartella clinica: non è pensata per conservare un referto.
      </p>

      <h3>Registrazione e accesso</h3>
      <p>
        L&apos;autenticazione (email e password) è gestita dal nostro fornitore di database,
        Supabase: la password non la vediamo mai in chiaro, viene trasformata (hashata) prima di
        essere salvata. Per limitare le iscrizioni automatizzate e le finte, al momento della
        registrazione verifichiamo un token generato da Cloudflare Turnstile (vedi &laquo;Con chi
        condividiamo i dati&raquo;) e registriamo l&apos;indirizzo IP di chi si registra, usato solo
        per applicare un limite giornaliero di iscrizioni dallo stesso indirizzo e contrastare gli
        abusi.
      </p>

      <h3>La mappa</h3>
      <p>
        Le mappe arrivano dai server di <strong>OpenStreetMap</strong>. Come accade con qualunque
        immagine caricata da internet, quei server vedono il tuo indirizzo IP e la zona che stai
        guardando. È il funzionamento normale di una mappa online, non una scelta nostra.
      </p>

      <h3>La dettatura vocale</h3>
      <p>
        Il microfono, dove disponibile, usa il riconoscimento vocale <strong>del browser che stai
        usando</strong>, non un servizio nostro: l&apos;audio non passa dai nostri server. Va detto
        con chiarezza che alcuni browser — Chrome fra questi — elaborano la voce sui propri server
        esterni. Se preferisci evitarlo, non usare il microfono e scrivi a mano: il risultato è
        identico.
      </p>

      <h3>Notifiche e preferenze nel browser</h3>
      <p>
        Se attivi le notifiche del promemoria appuntamenti, restano una funzione del tuo browser:
        non ti mandiamo notifiche da un server esterno, e non raccogliamo nulla per farlo
        funzionare. Nel tuo browser vengono inoltre salvate tre impostazioni locali — tema chiaro o
        scuro, dimensione del testo, promemoria di compleanno già mostrato — che servono solo a non
        richiedertele ogni volta e si cancellano svuotando i dati del sito.
      </p>

      <h2>Con chi condividiamo i dati</h2>
      <p>Non vendiamo né cediamo i tuoi dati a nessuno. Li condividiamo solo con chi ci serve per far funzionare il servizio:</p>
      <ul>
        <li>
          <strong>Supabase</strong> (database e autenticazione) e <strong>Vercel</strong> (hosting
          dell&apos;applicazione): conservano ed elaborano i dati per nostro conto, come fornitori
          tecnici.
        </li>
        <li>
          <strong>Cloudflare Turnstile</strong>: riceve l&apos;indirizzo IP e alcuni segnali del
          browser di chi si registra, per distinguere una persona vera da un programma automatico.
        </li>
        <li>
          <strong>Nominatim / OpenStreetMap</strong>: riceve il testo di un indirizzo quando lo cerchi
          senza usare il GPS, per trasformarlo in coordinate.
        </li>
        <li>
          <strong>Meta (Facebook)</strong>: solo se accetti dal banner che compare la prima volta,
          riceve dati di navigazione (pixel di misurazione) per farci capire come funzionano le
          nostre campagne pubblicitarie. Se rifiuti o ignori il banner, non si attiva.
        </li>
        <li>
          Un altro Fisioterapista o un altro paziente vedono, l&apos;uno dell&apos;altro, solo quanto
          descritto in questa pagina — mai l&apos;intera scheda dell&apos;altra parte.
        </li>
      </ul>

      <h2>Dove sono conservati i dati</h2>
      <p>
        I dati sono conservati sull&apos;infrastruttura dei nostri fornitori (Supabase e Vercel), che
        può risiedere anche fuori dallo Spazio Economico Europeo. Quando questo accade, il
        trasferimento avviene nell&apos;ambito delle garanzie che questi fornitori offrono ai clienti
        europei, fra cui le clausole contrattuali standard della Commissione Europea.
      </p>

      <h2>Per quanto tempo conserviamo i dati</h2>
      <p>
        I dati del tuo account (scheda, messaggi) restano finché l&apos;account resta attivo. Puoi
        chiedere la cancellazione in qualsiasi momento scrivendo a{" "}
        <a href="mailto:fisioterapistadomiciliare.info@gmail.com">
          fisioterapistadomiciliare.info@gmail.com
        </a>
        ; verrà eseguita entro un tempo ragionevole, salvo dati che dobbiamo conservare più a lungo
        per obbligo di legge. Gli indirizzi IP raccolti per contrastare gli abusi in fase di
        registrazione sono conservati solo per il tempo necessario a questo scopo.
      </p>

      <h2>Come proteggiamo i tuoi dati</h2>
      <ul>
        <li>Le connessioni fra il tuo browser e i nostri server avvengono in HTTPS.</li>
        <li>
          Ogni tabella del database applica regole di accesso a livello di riga (Row Level
          Security): un paziente non può leggere le schede di altri pazienti, un fisioterapista non
          può leggere i dati di un paziente con cui non ha mai parlato.
        </li>
        <li>
          Le chiavi con privilegi ampi sul database non vengono mai esposte al browser: restano solo
          sui nostri server, usate esclusivamente dove indispensabile (es. l&apos;approvazione di un
          fisioterapista da parte dell&apos;amministratore).
        </li>
        <li>Le password sono hashate da Supabase, mai salvate o trasmesse in chiaro.</li>
      </ul>

      <h2>La parte ancora dimostrativa</h2>
      <p>
        Il Medico e l&apos;intero percorso clinico formale — richiesta, assegnazione, referto,
        valutazioni, foto degli esercizi — sono ancora una <strong>dimostrazione</strong>: non
        elaborano dati reali e l&apos;accesso come Medico è un ingresso dimostrativo, non un account
        vero. Tutto il resto descritto in questa pagina — ricerca, registrazione, messaggistica — è
        invece pienamente funzionante e tratta dati reali.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi esercitare i diritti previsti dagli articoli 15-22 del GDPR: accesso ai tuoi dati,
        rettifica, cancellazione, limitazione del trattamento, portabilità e opposizione. Per
        qualsiasi richiesta scrivi a{" "}
        <a href="mailto:fisioterapistadomiciliare.info@gmail.com">
          fisioterapistadomiciliare.info@gmail.com
        </a>
        .
      </p>
      <p>
        Hai inoltre diritto di proporre reclamo al{" "}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
          Garante per la Protezione dei Dati Personali
        </a>
        .
      </p>

      <h2>Modifiche a questa informativa</h2>
      <p>
        Possiamo aggiornare questo testo quando cambia il modo in cui trattiamo i dati; la data in
        alto riporta l&apos;ultimo aggiornamento.
      </p>
    </PaginaLegale>
  );
}
