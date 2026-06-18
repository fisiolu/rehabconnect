import { StatoRichiesta, statoColore, statoLabel } from "@/lib/demoData";

export default function StatoBadge({ stato }: { stato: StatoRichiesta }) {
  return (
    <span className={`badge ${statoColore[stato]}`}>{statoLabel[stato]}</span>
  );
}
