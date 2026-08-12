import Image from "next/image";

interface Props {
  /** Lato del riquadro in pixel. */
  dimensione?: number;
  className?: string;
}

/**
 * Simbolo del logo ufficiale: la casa con le mani e il cuore.
 *
 * Il file logo.png è quadrato e contiene anche la scritta "Fisioterapista
 * Domiciliare" sotto il simbolo. Qui la scritta va esclusa, perché accanto
 * compare già il nome scritto: l'immagine viene quindi ingrandita e spostata
 * dentro un riquadro che ritaglia il solo simbolo.
 */
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
        className="absolute left-1/2 max-w-none -translate-x-1/2"
        style={{ width: dimensione * 2.3, height: dimensione * 2.3, top: `-${dimensione * 0.2}px` }}
      />
    </span>
  );
}
