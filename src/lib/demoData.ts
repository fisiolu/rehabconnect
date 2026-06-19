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
  specializzazione: string;
  telefono: string;
  email: string;
  disponibile: boolean;
  valutazione: number;
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
    dataNascita: "1955-03-15",
    codiceFiscale: "RSSMRA55C15H501Z",
    telefono: "333 1234567",
    email: "mario.rossi@email.it",
    indirizzo: "Via Roma 12, Milano",
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

export const fisioterapisti: Fisioterapista[] = [
  {
    id: "fis-001",
    nome: "Anna",
    cognome: "Ferrari",
    specializzazione: "Riabilitazione ortopedica",
    telefono: "348 1112233",
    email: "anna.ferrari@rehab.it",
    disponibile: true,
    valutazione: 4.8,
  },
  {
    id: "fis-002",
    nome: "Luca",
    cognome: "Esposito",
    specializzazione: "Neuroriabilitazione",
    telefono: "349 4445566",
    email: "luca.esposito@rehab.it",
    disponibile: true,
    valutazione: 4.6,
  },
  {
    id: "fis-003",
    nome: "Sara",
    cognome: "Romano",
    specializzazione: "Riabilitazione respiratoria",
    telefono: "340 7778899",
    email: "sara.romano@rehab.it",
    disponibile: false,
    valutazione: 4.9,
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
