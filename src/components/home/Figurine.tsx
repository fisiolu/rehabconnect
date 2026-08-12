import { svgFisioCamice, svgFisioCamicia } from "@/lib/figurine";

interface Props {
  dimensione?: number;
}

/**
 * Versioni React delle figurine dei segnaposto. Il disegno vive in
 * src/lib/figurine.ts perché lo usa anche la mappa vera, che lavora su HTML
 * grezzo e non può montare componenti React.
 */

export function FisioCamice({ dimensione = 34 }: Props) {
  return <span dangerouslySetInnerHTML={{ __html: svgFisioCamice(dimensione) }} />;
}

export function FisioCamicia({ dimensione = 34 }: Props) {
  return <span dangerouslySetInnerHTML={{ __html: svgFisioCamicia(dimensione) }} />;
}
