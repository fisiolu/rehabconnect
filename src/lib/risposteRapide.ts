/**
 * Frasi pronte da toccare invece di scrivere.
 *
 * Servono soprattutto al paziente anziano, per cui digitare su un telefono è
 * l'ostacolo vero: con un tocco manda una domanda sensata e la conversazione
 * parte. Al Fisioterapista servono per rispondere in fretta fra un domicilio
 * e l'altro.
 *
 * Sono divise fra apertura e prosecuzione perché la prima frase di una
 * conversazione è quella che costa di più: se è già scritta, si comincia.
 */

interface Set {
  apertura: string[];
  prosecuzione: string[];
}

export const RISPOSTE_PAZIENTE: Set = {
  apertura: [
    "Buongiorno, avrei bisogno di fisioterapia a domicilio.",
    "Viene anche nella mia zona?",
    "Quanto costa una seduta?",
    "Ho una prescrizione del medico.",
  ],
  prosecuzione: [
    "Quando avrebbe disponibilità?",
    "Quanto dura una seduta?",
    "Va bene, grazie.",
    "Mi può richiamare lei?",
  ],
};

export const RISPOSTE_FISIOTERAPISTA: Set = {
  apertura: [
    "Buongiorno, sì, copro la sua zona.",
    "Mi può dire di che problema si tratta?",
    "Ha una prescrizione o una relazione del medico?",
    "La richiamo io, mi dice quando le fa comodo?",
  ],
  prosecuzione: [
    "Le mando la mia disponibilità.",
    "Possiamo sentirci al telefono?",
    "Le confermo l'appuntamento.",
    "A presto, grazie.",
  ],
};

export function risposteFor(
  ruolo: "paziente" | "fisioterapista",
  conversazioneVuota: boolean
): string[] {
  const set = ruolo === "paziente" ? RISPOSTE_PAZIENTE : RISPOSTE_FISIOTERAPISTA;
  return conversazioneVuota ? set.apertura : set.prosecuzione;
}
