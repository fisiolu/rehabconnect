import Image from "next/image";

interface Props {
  /** Lato del riquadro in pixel. */
  dimensione?: number;
  className?: string;
}

/**
 * Simbolo del logo ufficiale: la casa con le mani e il cuore.
 *
 * Il file logo.png è quadrato e sotto al simbolo porta anche la scritta
 * "Fisioterapista Domiciliare". Qui la scritta va esclusa, perché accanto
 * compare già il nome: l'immagine viene quindi ingrandita e spostata dentro
 * un riquadro che ritaglia il solo simbolo.
 *
 * I tre numeri qui sotto non sono a occhio: derivano dalla misura dei pixel
 * dell'immagine. Il simbolo occupa dal 30% al 70% in larghezza e dal 21,5%
 * al 63,5% in altezza, quindi il suo centro sta al 50% / 42,5% — spostato in
 * alto rispetto al centro del file. Se un giorno il logo cambia, vanno
 * rimisurati, altrimenti il simbolo esce storto.
 */
const SCALA = 2.095; // porta il simbolo a occupare l'88% del riquadro
const SINISTRA = -0.548;
const ALTO = -0.39;

export default function LogoUfficiale({ dimensione = 40, className = "" }: Props) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${className}`}
      style={{ width: dimensione, height: dimensione }}
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        width={2000}
        height={2000}
        priority
        className="absolute max-w-none"
        style={{
          width: dimensione * SCALA,
          height: dimensione * SCALA,
          left: dimensione * SINISTRA,
          top: dimensione * ALTO,
        }}
      />
    </span>
  );
}
