import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pagina non trovata
        </h1>
        <p className="text-gray-500 mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
