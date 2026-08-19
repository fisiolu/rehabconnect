import type { Metadata } from "next";
import PaginaLegale from "@/components/PaginaLegale";
import BottonePreferenzeCookie from "@/components/BottonePreferenzeCookie";

export const metadata: Metadata = {
  title: "Cookie policy — Fisioterapista Domiciliare",
  description:
    "Quali cookie e strumenti di memorizzazione usa l'app Fisioterapista Domiciliare, a cosa servono e come cambiare le tue scelte.",
};

export default function CookiePage() {
  return (
    <PaginaLegale titolo="Cookie policy" aggiornamento="agosto 2026">
      <p>
        Questa pagina elenca gli strumenti che l&apos;app usa per salvare informazioni sul tuo
        dispositivo. Sono pochi, e sono elencati per intero: non ce ne sono altri.
      </p>

      <h2>Cosa sono</h2>
      <p>
        Un cookie è un piccolo file che un sito lascia sul tuo dispositivo per ricordarsi qualcosa.
        Esistono strumenti simili — come la <em>memoria locale</em> del browser — che funzionano
        allo stesso modo. Qui li trattiamo tutti insieme, perché per te fa lo stesso.
      </p>
      <p>La distinzione che conta è un&apos;altra:</p>
      <ul>
        <li>
          <strong>Tecnici</strong>: servono a far funzionare l&apos;app. Senza, non potresti
          restare collegato o non vedresti le tue impostazioni. Non richiedono il tuo consenso.
        </li>
        <li>
          <strong>Di misurazione o pubblicitari</strong>: servono a capire come viene usata l&apos;app
          o a misurare campagne pubblicitarie. Questi <strong>richiedono il tuo consenso</strong> e
          restano spenti finché non lo dai.
        </li>
      </ul>

      <h2>Quelli tecnici, sempre attivi</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>A cosa serve</th>
            <th>Quanto dura</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sessione di accesso (Supabase)</td>
            <td>Ti tiene collegato dopo che hai fatto l&apos;accesso</td>
            <td>Fino all&apos;uscita o alla scadenza della sessione</td>
          </tr>
          <tr>
            <td>Cloudflare Turnstile</td>
            <td>
              Distingue una persona vera da un programma automatico durante la registrazione
            </td>
            <td>Il tempo della verifica</td>
          </tr>
          <tr>
            <td>
              <code>rc-tema</code>, <code>rc-testo</code>
            </td>
            <td>Ricordano se preferisci il tema scuro e il testo ingrandito</td>
            <td>Finché non svuoti i dati del sito</td>
          </tr>
          <tr>
            <td>
              <code>rc-consenso-meta</code>
            </td>
            <td>Ricorda la scelta che hai fatto qui sotto, per non richiedertela ogni volta</td>
            <td>Finché non svuoti i dati del sito</td>
          </tr>
        </tbody>
      </table>

      <h2>Quello che richiede il tuo consenso</h2>
      <table>
        <thead>
          <tr>
            <th>Strumento</th>
            <th>Chi lo gestisce</th>
            <th>A cosa serve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Meta Pixel</td>
            <td>Meta Platforms Ireland Ltd.</td>
            <td>
              Misura i risultati delle campagne pubblicitarie: segnala a Meta che hai visitato
              l&apos;app e quali pagine hai aperto
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Resta spento finché non premi &laquo;Accetta&raquo;.</strong> Non è nascosto o
        disattivato: proprio non viene caricato. Se rifiuti, non parte affatto; se prima avevi
        accettato e poi rifiuti, la pagina si ricarica per toglierlo davvero.
      </p>

      <h2>Cambiare idea</h2>
      <p>
        Puoi modificare la tua scelta in qualsiasi momento, ed è semplice quanto darla: premi qui
        sotto e il banner ricompare.
      </p>
      <p>
        <BottonePreferenzeCookie />
      </p>
      <p>
        In alternativa puoi cancellare i dati del sito dalle impostazioni del tuo browser: al
        ritorno ti verrà richiesto tutto da capo.
      </p>

      <h2>Il sito e l&apos;app sono due cose diverse</h2>
      <p>
        Questa pagina riguarda l&apos;app (<code>app.fisioterapistadomiciliare.it</code>). Il sito
        informativo <code>fisioterapistadomiciliare.it</code> non usa il Meta Pixel e non installa
        cookie di misurazione: raccoglie solo statistiche di traffico aggregate e senza cookie.
      </p>

      <h2>Altro che potresti aspettarti e qui non c&apos;è</h2>
      <p>
        Non usiamo Google Analytics, non usiamo cookie di profilazione pubblicitaria oltre a quello
        indicato, non rivendiamo dati a nessuno e non ci sono reti pubblicitarie di terze parti.
        Le mappe provengono da OpenStreetMap, che vede il tuo indirizzo IP come qualunque sito da
        cui carichi un&apos;immagine, ma non installa cookie sul tuo dispositivo.
      </p>
    </PaginaLegale>
  );
}
