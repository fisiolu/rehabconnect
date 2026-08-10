export type Ruolo = "paziente" | "medico" | "fisioterapista" | "admin";

export type StatoRichiesta =
  | "in_attesa"
  | "in_valutazione"
  | "assegnata"
  | "in_corso"
  | "completata"
  | "rifiutata";

export interface Paziente {
  id: string;
  nome: string;
  cognome: string;
  dataNascita: string;
  codiceFiscale: string;
  telefono: string;
  email: string;
  indirizzo: string;
  /** Coordinate del domicilio: è il punto da cui si misura la vicinanza dei fisioterapisti. */
  domicilio: {
    lat: number;
    lng: number;
  };
  medicoId: string;
}

export interface Medico {
  id: string;
  nome: string;
  cognome: string;
  specializzazione: string;
  telefono: string;
  email: string;
  ambulatorio: string;
}

export interface Fisioterapista {
  id: string;
  nome: string;
  cognome: string;
  /** Elenco delle specialità, la prima è quella principale. */
  specializzazioni: string[];
  telefono: string;
  email: string;
  disponibile: boolean;
  valutazione: number;
  /** Numero di iscrizione all'albo, da verificare prima di pubblicare un profilo. */
  numeroAlbo: string;
  /** Punto da cui parte per le visite domiciliari (studio o abitazione). */
  base: {
    lat: number;
    lng: number;
    citta: string;
    provincia: string;
  };
  /** Quanti chilometri è disposto a percorrere per un domicilio. */
  raggioKm: number;
  anniEsperienza: number;
  presentazione: string;
}

export interface Appuntamento {
  id: string;
  richiestaId: string;
  data: string;
  ora: string;
  durata: number;
  luogo: string;
  note?: string;
  completato: boolean;
}

export interface Richiesta {
  id: string;
  pazienteId: string;
  medicoId: string;
  fisioterapistaId?: string;
  stato: StatoRichiesta;
  dataCreazione: string;
  dataAggiornamento: string;
  patologia: string;
  descrizione: string;
  tipoIntervento: "domiciliare" | "studio";
  urgenza: "normale" | "urgente";
  noteMedico?: string;
  noteFisioterapista?: string;
  appuntamenti: Appuntamento[];
}

export interface Messaggio {
  id: string;
  richiestaId: string;
  mittente: string;
  mittentId: string;
  ruolo: Ruolo;
  testo: string;
  timestamp: string;
}

export interface Notifica {
  id: string;
  destinatarioId: string;
  testo: string;
  tipo: "info" | "successo" | "attenzione";
  letto: boolean;
  timestamp: string;
  richiestaId?: string;
}

export interface Valutazione {
  id: string;
  richiestaId: string;
  appuntamentoId: string;
  pazienteId: string;
  stelle: 1 | 2 | 3 | 4 | 5;
  nota?: string;
  data: string;
}

export interface FotoEsercizio {
  id: string;
  richiestaId: string;
  appuntamentoId: string;
  fisioterapistaId: string;
  dataUrl: string;
  descrizione?: string;
  timestamp: string;
}

export interface Posizione {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: string;
  indirizzo?: string;
}

export const posizioniDemo: Record<string, Posizione> = {
  "paz-001": {
    lat: 45.4800,
    lng: 9.2050,
    timestamp: "2026-06-18T08:30:00",
    indirizzo: "Via Roma 12, Milano",
  },
  "paz-002": {
    lat: 45.4660,
    lng: 9.1720,
    timestamp: "2026-06-18T09:00:00",
    indirizzo: "Via Dante 45, Milano",
  },
  "paz-003": {
    lat: 45.4520,
    lng: 9.1900,
    timestamp: "2026-06-17T16:30:00",
    indirizzo: "Corso Vittorio 8, Milano",
  },
};

export const pazienti: Paziente[] = [
  {
    id: "paz-001",
    nome: "Mario",
    cognome: "Rossi",
    dataNascita: "1955-06-19",
    codiceFiscale: "RSSMRA55C15H501Z",
    telefono: "333 1234567",
    email: "mario.rossi@email.it",
    indirizzo: "Via Roma 12, Milano",
    domicilio: { lat: 45.48, lng: 9.205 },
    medicoId: "med-001",
  },
  {
    id: "paz-002",
    nome: "Lucia",
    cognome: "Bianchi",
    dataNascita: "1968-07-22",
    codiceFiscale: "BNCLCU68L62H501X",
    telefono: "347 9876543",
    email: "lucia.bianchi@email.it",
    indirizzo: "Via Dante 45, Milano",
    domicilio: { lat: 45.466, lng: 9.172 },
    medicoId: "med-001",
  },
  {
    id: "paz-003",
    nome: "Giuseppe",
    cognome: "Verdi",
    dataNascita: "1942-11-08",
    codiceFiscale: "VRDGPP42S08H501W",
    telefono: "389 5556666",
    email: "giuseppe.verdi@email.it",
    indirizzo: "Corso Vittorio 8, Milano",
    domicilio: { lat: 45.452, lng: 9.19 },
    medicoId: "med-002",
  },
];

export const medici: Medico[] = [
  {
    id: "med-001",
    nome: "Francesca",
    cognome: "Marino",
    specializzazione: "Medicina Generale",
    telefono: "02 1234567",
    email: "f.marino@asl.it",
    ambulatorio: "Via della Salute 3, Milano",
  },
  {
    id: "med-002",
    nome: "Roberto",
    cognome: "Conti",
    specializzazione: "Medicina Generale",
    telefono: "02 7654321",
    email: "r.conti@asl.it",
    ambulatorio: "Via Manzoni 22, Milano",
  },
];

/**
 * Fisioterapisti dimostrativi distribuiti su tutto il territorio italiano.
 * Servono a mostrare la ricerca per vicinanza ovunque l'app venga aperta:
 * ci sono gruppi più fitti nelle zone in cui è più probabile che venga provata.
 * Nomi, recapiti e numeri d'albo sono inventati.
 */
export const fisioterapisti: Fisioterapista[] = [
  // ---- Milano e hinterland ----
  {
    id: "fis-001",
    nome: "Anna",
    cognome: "Ferrari",
    specializzazioni: ["Riabilitazione ortopedica", "Terapia manuale"],
    telefono: "348 1112233",
    email: "anna.ferrari@rehab.it",
    disponibile: true,
    valutazione: 4.8,
    numeroAlbo: "TSRM-PSTRP MI 1847",
    base: { lat: 45.4785, lng: 9.2115, citta: "Milano", provincia: "MI" },
    raggioKm: 15,
    anniEsperienza: 12,
    presentazione:
      "Mi occupo di recupero funzionale dopo fratture e interventi ortopedici, con particolare attenzione alle persone anziane.",
  },
  {
    id: "fis-002",
    nome: "Luca",
    cognome: "Esposito",
    specializzazioni: ["Neuroriabilitazione", "Riabilitazione geriatrica"],
    telefono: "349 4445566",
    email: "luca.esposito@rehab.it",
    disponibile: true,
    valutazione: 4.6,
    numeroAlbo: "TSRM-PSTRP MI 2103",
    base: { lat: 45.4695, lng: 9.181, citta: "Milano", provincia: "MI" },
    raggioKm: 12,
    anniEsperienza: 9,
    presentazione:
      "Seguo a domicilio persone con esiti di ictus e malattie neurodegenerative, lavorando anche con i familiari.",
  },
  {
    id: "fis-003",
    nome: "Sara",
    cognome: "Romano",
    specializzazioni: ["Riabilitazione respiratoria", "Riabilitazione cardiologica"],
    telefono: "340 7778899",
    email: "sara.romano@rehab.it",
    disponibile: false,
    valutazione: 4.9,
    numeroAlbo: "TSRM-PSTRP MI 1592",
    base: { lat: 45.5333, lng: 9.2333, citta: "Sesto San Giovanni", provincia: "MI" },
    raggioKm: 10,
    anniEsperienza: 15,
    presentazione:
      "Fisioterapia respiratoria a domicilio, anche per pazienti con ossigenoterapia e post-ricovero.",
  },
  {
    id: "fis-004",
    nome: "Marco",
    cognome: "Colombo",
    specializzazioni: ["Riabilitazione sportiva", "Rieducazione posturale"],
    telefono: "347 2223344",
    email: "marco.colombo@rehab.it",
    disponibile: true,
    valutazione: 4.4,
    numeroAlbo: "TSRM-PSTRP MI 2571",
    base: { lat: 45.45, lng: 9.175, citta: "Milano", provincia: "MI" },
    raggioKm: 20,
    anniEsperienza: 7,
    presentazione:
      "Recupero da infortuni sportivi e correzione delle posture scorrette, con programmi da proseguire a casa.",
  },

  // ---- Lazio meridionale (golfo di Gaeta) ----
  {
    id: "fis-005",
    nome: "Giulia",
    cognome: "De Santis",
    specializzazioni: ["Riabilitazione ortopedica", "Riabilitazione geriatrica"],
    telefono: "339 4561122",
    email: "giulia.desantis@rehab.it",
    disponibile: true,
    valutazione: 4.9,
    numeroAlbo: "TSRM-PSTRP LT 0784",
    base: { lat: 41.261, lng: 13.6135, citta: "Formia", provincia: "LT" },
    raggioKm: 25,
    anniEsperienza: 14,
    presentazione:
      "Riabilitazione a domicilio nel golfo di Gaeta, specializzata nel recupero dopo protesi d'anca e di ginocchio.",
  },
  {
    id: "fis-006",
    nome: "Antonio",
    cognome: "Parisi",
    specializzazioni: ["Neuroriabilitazione", "Riabilitazione post-operatoria"],
    telefono: "333 7788990",
    email: "antonio.parisi@rehab.it",
    disponibile: true,
    valutazione: 4.7,
    numeroAlbo: "TSRM-PSTRP LT 0912",
    base: { lat: 41.2135, lng: 13.571, citta: "Gaeta", provincia: "LT" },
    raggioKm: 20,
    anniEsperienza: 11,
    presentazione:
      "Percorsi neurologici a domicilio, con valutazione iniziale gratuita e obiettivi concordati con il paziente.",
  },
  {
    id: "fis-007",
    nome: "Valentina",
    cognome: "Iannone",
    specializzazioni: ["Linfodrenaggio", "Riabilitazione pavimento pelvico"],
    telefono: "320 1122334",
    email: "valentina.iannone@rehab.it",
    disponibile: true,
    valutazione: 4.8,
    numeroAlbo: "TSRM-PSTRP LT 1055",
    base: { lat: 41.2617, lng: 13.7472, citta: "Minturno", provincia: "LT" },
    raggioKm: 18,
    anniEsperienza: 8,
    presentazione:
      "Trattamento del linfedema e riabilitazione del pavimento pelvico, anche nel percorso post-parto.",
  },
  {
    id: "fis-008",
    nome: "Roberto",
    cognome: "Fusco",
    specializzazioni: ["Terapia manuale", "Riabilitazione ortopedica"],
    telefono: "345 6677889",
    email: "roberto.fusco@rehab.it",
    disponibile: false,
    valutazione: 4.5,
    numeroAlbo: "TSRM-PSTRP LT 0641",
    base: { lat: 41.4676, lng: 12.9037, citta: "Latina", provincia: "LT" },
    raggioKm: 30,
    anniEsperienza: 18,
    presentazione:
      "Terapia manuale per dolori cervicali e lombari, con esercizi personalizzati da fare in autonomia.",
  },

  // ---- Roma ----
  {
    id: "fis-009",
    nome: "Chiara",
    cognome: "Bruno",
    specializzazioni: ["Riabilitazione geriatrica", "Riabilitazione post-operatoria"],
    telefono: "348 9900112",
    email: "chiara.bruno@rehab.it",
    disponibile: true,
    valutazione: 4.7,
    numeroAlbo: "TSRM-PSTRP RM 3312",
    base: { lat: 41.9109, lng: 12.465, citta: "Roma", provincia: "RM" },
    raggioKm: 15,
    anniEsperienza: 10,
    presentazione:
      "Assistenza riabilitativa a domicilio per persone non autosufficienti, in accordo con la famiglia.",
  },
  {
    id: "fis-010",
    nome: "Davide",
    cognome: "Neri",
    specializzazioni: ["Riabilitazione sportiva", "Terapia manuale"],
    telefono: "331 4455667",
    email: "davide.neri@rehab.it",
    disponibile: true,
    valutazione: 4.3,
    numeroAlbo: "TSRM-PSTRP RM 4108",
    base: { lat: 41.833, lng: 12.47, citta: "Roma", provincia: "RM" },
    raggioKm: 18,
    anniEsperienza: 6,
    presentazione:
      "Lavoro con chi vuole tornare all'attività fisica dopo un infortunio, senza bruciare le tappe.",
  },
  {
    id: "fis-011",
    nome: "Elena",
    cognome: "Ricci",
    specializzazioni: ["Neuroriabilitazione", "Riabilitazione neurologica infantile"],
    telefono: "349 3344556",
    email: "elena.ricci@rehab.it",
    disponibile: true,
    valutazione: 5,
    numeroAlbo: "TSRM-PSTRP RM 2876",
    base: { lat: 41.87, lng: 12.54, citta: "Roma", provincia: "RM" },
    raggioKm: 20,
    anniEsperienza: 16,
    presentazione:
      "Riabilitazione neurologica in età evolutiva, con percorsi condivisi con la famiglia e la scuola.",
  },

  // ---- Campania ----
  {
    id: "fis-012",
    nome: "Salvatore",
    cognome: "Amato",
    specializzazioni: ["Riabilitazione ortopedica", "Riabilitazione geriatrica"],
    telefono: "338 5566778",
    email: "salvatore.amato@rehab.it",
    disponibile: true,
    valutazione: 4.6,
    numeroAlbo: "TSRM-PSTRP NA 1934",
    base: { lat: 40.846, lng: 14.229, citta: "Napoli", provincia: "NA" },
    raggioKm: 15,
    anniEsperienza: 13,
    presentazione:
      "Riabilitazione domiciliare a Napoli e provincia, con disponibilità anche nel fine settimana.",
  },
  {
    id: "fis-013",
    nome: "Rosa",
    cognome: "Del Prete",
    specializzazioni: ["Riabilitazione respiratoria", "Riabilitazione post-operatoria"],
    telefono: "329 6677001",
    email: "rosa.delprete@rehab.it",
    disponibile: true,
    valutazione: 4.8,
    numeroAlbo: "TSRM-PSTRP CE 0827",
    base: { lat: 41.0722, lng: 14.332, citta: "Caserta", provincia: "CE" },
    raggioKm: 22,
    anniEsperienza: 9,
    presentazione:
      "Seguo il rientro a casa dopo interventi importanti, coordinandomi con il medico curante.",
  },

  // ---- Resto d'Italia ----
  {
    id: "fis-014",
    nome: "Federico",
    cognome: "Gallo",
    specializzazioni: ["Rieducazione posturale", "Terapia manuale"],
    telefono: "347 8899223",
    email: "federico.gallo@rehab.it",
    disponibile: true,
    valutazione: 4.5,
    numeroAlbo: "TSRM-PSTRP TO 1466",
    base: { lat: 45.0755, lng: 7.6785, citta: "Torino", provincia: "TO" },
    raggioKm: 18,
    anniEsperienza: 11,
    presentazione:
      "Mi dedico ai dolori cronici della colonna, con un percorso graduale e verificabile nel tempo.",
  },
  {
    id: "fis-015",
    nome: "Martina",
    cognome: "Conti",
    specializzazioni: ["Riabilitazione pavimento pelvico", "Linfodrenaggio"],
    telefono: "340 2211445",
    email: "martina.conti@rehab.it",
    disponibile: true,
    valutazione: 4.9,
    numeroAlbo: "TSRM-PSTRP BO 0993",
    base: { lat: 44.489, lng: 11.352, citta: "Bologna", provincia: "BO" },
    raggioKm: 16,
    anniEsperienza: 12,
    presentazione:
      "Riabilitazione del pavimento pelvico e trattamento del linfedema dopo interventi oncologici.",
  },
  {
    id: "fis-016",
    nome: "Alessandro",
    cognome: "Fabbri",
    specializzazioni: ["Riabilitazione cardiologica", "Riabilitazione geriatrica"],
    telefono: "333 9911224",
    email: "alessandro.fabbri@rehab.it",
    disponibile: false,
    valutazione: 4.4,
    numeroAlbo: "TSRM-PSTRP FI 1201",
    base: { lat: 43.7752, lng: 11.247, citta: "Firenze", provincia: "FI" },
    raggioKm: 14,
    anniEsperienza: 20,
    presentazione:
      "Riprendere il movimento in sicurezza dopo un evento cardiaco, con carichi controllati.",
  },
  {
    id: "fis-017",
    nome: "Nicola",
    cognome: "Lorusso",
    specializzazioni: ["Riabilitazione ortopedica", "Riabilitazione sportiva"],
    telefono: "328 4433221",
    email: "nicola.lorusso@rehab.it",
    disponibile: true,
    valutazione: 4.6,
    numeroAlbo: "TSRM-PSTRP BA 0715",
    base: { lat: 41.123, lng: 16.864, citta: "Bari", provincia: "BA" },
    raggioKm: 20,
    anniEsperienza: 8,
    presentazione:
      "Riabilitazione ortopedica a domicilio a Bari e nei comuni vicini, anche in orario serale.",
  },
  {
    id: "fis-018",
    nome: "Grazia",
    cognome: "Randazzo",
    specializzazioni: ["Neuroriabilitazione", "Riabilitazione geriatrica"],
    telefono: "347 5544332",
    email: "grazia.randazzo@rehab.it",
    disponibile: true,
    valutazione: 4.7,
    numeroAlbo: "TSRM-PSTRP PA 1338",
    base: { lat: 38.1215, lng: 13.353, citta: "Palermo", provincia: "PA" },
    raggioKm: 18,
    anniEsperienza: 15,
    presentazione:
      "Assisto a domicilio persone con esiti neurologici, curando anche l'addestramento dei caregiver.",
  },
  {
    id: "fis-019",
    nome: "Paolo",
    cognome: "Marras",
    specializzazioni: ["Terapia manuale", "Rieducazione posturale"],
    telefono: "331 7766554",
    email: "paolo.marras@rehab.it",
    disponibile: true,
    valutazione: 4.5,
    numeroAlbo: "TSRM-PSTRP CA 0562",
    base: { lat: 39.2238, lng: 9.1217, citta: "Cagliari", provincia: "CA" },
    raggioKm: 25,
    anniEsperienza: 10,
    presentazione:
      "Trattamento manuale di spalla, collo e schiena, con esercizi semplici da ripetere a casa.",
  },
  {
    id: "fis-020",
    nome: "Silvia",
    cognome: "Zanetti",
    specializzazioni: ["Riabilitazione post-operatoria", "Riabilitazione ortopedica"],
    telefono: "345 1199887",
    email: "silvia.zanetti@rehab.it",
    disponibile: true,
    valutazione: 4.8,
    numeroAlbo: "TSRM-PSTRP VR 0847",
    base: { lat: 45.4384, lng: 10.9916, citta: "Verona", provincia: "VR" },
    raggioKm: 20,
    anniEsperienza: 13,
    presentazione:
      "Recupero dopo interventi ortopedici, con contatto diretto con il chirurgo quando serve.",
  },
];

export const richieste: Richiesta[] = [
  {
    id: "req-001",
    pazienteId: "paz-001",
    medicoId: "med-001",
    fisioterapistaId: "fis-001",
    stato: "in_corso",
    dataCreazione: "2026-06-01",
    dataAggiornamento: "2026-06-05",
    patologia: "Protesi anca sinistra",
    descrizione:
      "Paziente operato per protesi d'anca. Necessita riabilitazione post-operatoria domiciliare.",
    tipoIntervento: "domiciliare",
    urgenza: "normale",
    noteMedico: "Iniziare con esercizi a basso impatto. Evitare rotazioni.",
    noteFisioterapista: "Prima seduta effettuata. Paziente collaborativo.",
    appuntamenti: [
      { id: "app-h1", richiestaId: "req-001", data: "2026-06-02", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: true },
      { id: "app-h2", richiestaId: "req-001", data: "2026-06-05", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: true },
      { id: "app-h3", richiestaId: "req-001", data: "2026-06-09", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: true },
      { id: "app-h4", richiestaId: "req-001", data: "2026-06-12", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: true },
      { id: "app-h5", richiestaId: "req-001", data: "2026-06-16", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: true },
      { id: "app-001", richiestaId: "req-001", data: "2026-06-19", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: false },
      { id: "app-002", richiestaId: "req-001", data: "2026-06-22", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: false },
      { id: "app-003", richiestaId: "req-001", data: "2026-06-26", ora: "09:00", durata: 60, luogo: "Via Roma 12, Milano", completato: false },
    ],
  },
  {
    id: "req-002",
    pazienteId: "paz-002",
    medicoId: "med-001",
    stato: "in_valutazione",
    dataCreazione: "2026-06-15",
    dataAggiornamento: "2026-06-15",
    patologia: "Lombalgia cronica",
    descrizione:
      "Paziente con lombalgia cronica da 3 mesi. Richiede ciclo di fisioterapia.",
    tipoIntervento: "studio",
    urgenza: "normale",
    appuntamenti: [],
  },
  {
    id: "req-003",
    pazienteId: "paz-003",
    medicoId: "med-002",
    stato: "in_attesa",
    dataCreazione: "2026-06-17",
    dataAggiornamento: "2026-06-17",
    patologia: "Ictus – recupero motorio",
    descrizione:
      "Paziente post-ictus ischemico. Necessita neuroriabilitazione domiciliare urgente.",
    tipoIntervento: "domiciliare",
    urgenza: "urgente",
    appuntamenti: [],
  },
];

export const messaggiDemo: Messaggio[] = [
  {
    id: "msg-001",
    richiestaId: "req-001",
    mittente: "Dr.ssa Marino",
    mittentId: "med-001",
    ruolo: "medico",
    testo: "Buongiorno Mario. Ho assegnato la sua riabilitazione alla fisioterapista Anna Ferrari. Si raccomanda di iniziare con movimenti leggeri.",
    timestamp: "2026-06-05T09:30:00",
  },
  {
    id: "msg-002",
    richiestaId: "req-001",
    mittente: "Mario Rossi",
    mittentId: "paz-001",
    ruolo: "paziente",
    testo: "Grazie dottoressa. Quando iniziamo?",
    timestamp: "2026-06-05T10:15:00",
  },
  {
    id: "msg-003",
    richiestaId: "req-001",
    mittente: "Anna Ferrari",
    mittentId: "fis-001",
    ruolo: "fisioterapista",
    testo: "Buongiorno Mario! La raggiungo venerdì 19 alle 9:00. Prepari abbigliamento comodo e uno spazio libero.",
    timestamp: "2026-06-05T11:00:00",
  },
  {
    id: "msg-004",
    richiestaId: "req-001",
    mittente: "Mario Rossi",
    mittentId: "paz-001",
    ruolo: "paziente",
    testo: "Perfetto, a venerdì! Posso fare qualcosa nel frattempo?",
    timestamp: "2026-06-05T11:30:00",
  },
  {
    id: "msg-005",
    richiestaId: "req-001",
    mittente: "Anna Ferrari",
    mittentId: "fis-001",
    ruolo: "fisioterapista",
    testo: "Sì, cammini pure brevemente in piano, eviti le scale e dorma con un cuscino tra le ginocchia.",
    timestamp: "2026-06-05T11:45:00",
  },
];

export const notificheDemo: Notifica[] = [
  {
    id: "notif-001",
    destinatarioId: "paz-001",
    testo: "La sua richiesta \"Protesi anca sinistra\" è stata assegnata ad Anna Ferrari.",
    tipo: "successo",
    letto: true,
    timestamp: "2026-06-05T09:00:00",
    richiestaId: "req-001",
  },
  {
    id: "notif-002",
    destinatarioId: "fis-001",
    testo: "Nuovo incarico: riabilitazione post-operatoria per Mario Rossi. In attesa di accettazione.",
    tipo: "info",
    letto: true,
    timestamp: "2026-06-05T09:00:00",
    richiestaId: "req-001",
  },
  {
    id: "notif-003",
    destinatarioId: "med-001",
    testo: "Nuova richiesta da Lucia Bianchi: Lombalgia cronica.",
    tipo: "attenzione",
    letto: false,
    timestamp: "2026-06-15T14:00:00",
    richiestaId: "req-002",
  },
  {
    id: "notif-004",
    destinatarioId: "paz-001",
    testo: "Anna Ferrari ha accettato il tuo incarico. La riabilitazione è iniziata.",
    tipo: "successo",
    letto: false,
    timestamp: "2026-06-06T08:00:00",
    richiestaId: "req-001",
  },
];

export const valutazioniDemo: Valutazione[] = [
  { id: "val-001", richiestaId: "req-001", appuntamentoId: "app-h1", pazienteId: "paz-001", stelle: 5, nota: "Fisioterapista molto professionale e gentile.", data: "2026-06-02" },
  { id: "val-002", richiestaId: "req-001", appuntamentoId: "app-h2", pazienteId: "paz-001", stelle: 4, nota: "Seduta intensa ma efficace. Miglioramento visibile.", data: "2026-06-05" },
  { id: "val-003", richiestaId: "req-001", appuntamentoId: "app-h3", pazienteId: "paz-001", stelle: 5, nota: "Ottimo recupero! Sto camminando meglio.", data: "2026-06-09" },
  { id: "val-004", richiestaId: "req-001", appuntamentoId: "app-h4", pazienteId: "paz-001", stelle: 4, nota: "Buon lavoro sulle rotazioni.", data: "2026-06-12" },
  { id: "val-005", richiestaId: "req-001", appuntamentoId: "app-h5", pazienteId: "paz-001", stelle: 5, nota: "Sono molto soddisfatto dei progressi.", data: "2026-06-16" },
];

export const fotoEserciziDemo: FotoEsercizio[] = [];

export const statoLabel: Record<StatoRichiesta, string> = {
  in_attesa: "In attesa",
  in_valutazione: "In valutazione",
  assegnata: "Assegnata",
  in_corso: "In corso",
  completata: "Completata",
  rifiutata: "Rifiutata",
};

export const statoColore: Record<StatoRichiesta, string> = {
  in_attesa: "bg-yellow-100 text-yellow-800",
  in_valutazione: "bg-blue-100 text-blue-800",
  assegnata: "bg-purple-100 text-purple-800",
  in_corso: "bg-green-100 text-green-800",
  completata: "bg-gray-100 text-gray-800",
  rifiutata: "bg-red-100 text-red-800",
};
