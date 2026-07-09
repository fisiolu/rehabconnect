export function IconaPazienteSediaARotelle({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* ruota grande */}
      <circle cx="34" cy="70" r="19" fill="none" stroke="#334155" strokeWidth="4" />
      <circle cx="34" cy="70" r="3" fill="#334155" />
      <line x1="34" y1="70" x2="34" y2="53" stroke="#334155" strokeWidth="2" />
      <line x1="34" y1="70" x2="48" y2="76" stroke="#334155" strokeWidth="2" />
      <line x1="34" y1="70" x2="20" y2="76" stroke="#334155" strokeWidth="2" />
      {/* rotella anteriore */}
      <circle cx="74" cy="86" r="6" fill="#334155" />
      <rect x="55" y="80" width="22" height="4" rx="2" fill="#64748b" />
      <rect x="53" y="62" width="4" height="20" rx="2" fill="#64748b" />
      {/* seduta e schienale */}
      <rect x="30" y="58" width="30" height="7" rx="3" fill="#64748b" />
      <rect x="25" y="35" width="7" height="28" rx="3" fill="#64748b" />
      {/* busto */}
      <rect x="30" y="38" width="28" height="24" rx="10" fill="#3b82f6" />
      {/* braccio verso la ruota */}
      <path d="M33 48 Q25 58 30 67" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="30" cy="67" r="5" fill="#f4c9a0" />
      {/* testa */}
      <circle cx="46" cy="22" r="13" fill="#f4c9a0" />
      <path d="M33 19a13 13 0 0126 0Z" fill="#6b4423" />
      {/* volto */}
      <circle cx="42" cy="23" r="1.4" fill="#3f2a18" />
      <circle cx="50" cy="23" r="1.4" fill="#3f2a18" />
      <path d="M42 28 Q46 31 50 28" stroke="#3f2a18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function IconaFisioterapista({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* pantaloni */}
      <rect x="38" y="62" width="10" height="30" rx="3" fill="#1e293b" />
      <rect x="52" y="62" width="10" height="30" rx="3" fill="#1e293b" />
      {/* scarpe */}
      <rect x="35" y="89" width="15" height="5" rx="2" fill="#0f172a" />
      <rect x="50" y="89" width="15" height="5" rx="2" fill="#0f172a" />
      {/* cintura */}
      <rect x="35" y="61.5" width="30" height="3.5" fill="#1e293b" />
      {/* camicia */}
      <path d="M32 38 L68 38 L65 65 L35 65 Z" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="2" />
      {/* colletto */}
      <path d="M43 38 L50 47 L57 38" fill="#dbeafe" stroke="#38bdf8" strokeWidth="1.5" />
      {/* bottoni */}
      <circle cx="50" cy="50" r="1.3" fill="#38bdf8" />
      <circle cx="50" cy="56" r="1.3" fill="#38bdf8" />
      {/* maniche */}
      <rect x="21" y="40" width="14" height="10" rx="5" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="65" y="40" width="14" height="10" rx="5" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1.5" />
      {/* mani */}
      <circle cx="19" cy="50" r="5" fill="#f4c9a0" />
      <circle cx="81" cy="50" r="5" fill="#f4c9a0" />
      {/* badge identificativo */}
      <rect x="56" y="44" width="7" height="9" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
      <rect x="58" y="46" width="3" height="3" fill="#7c3aed" />
      {/* testa */}
      <circle cx="50" cy="22" r="13" fill="#f4c9a0" />
      <path d="M37 20a13 13 0 0126 0Z" fill="#3f3f46" />
      {/* volto */}
      <circle cx="46" cy="23" r="1.4" fill="#3f2a18" />
      <circle cx="54" cy="23" r="1.4" fill="#3f2a18" />
      <path d="M45 28 Q50 31 55 28" stroke="#3f2a18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
