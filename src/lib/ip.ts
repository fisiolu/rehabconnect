/**
 * `x-forwarded-for` può contenere una catena "client, proxy1, proxy2":
 * il primo valore è quello del visitatore, gli altri sono i proxy che
 * Vercel ha attraversato.
 */
export function estraiIp(request: Request): string | null {
  const header = request.headers.get("x-forwarded-for");
  if (!header) return null;
  return header.split(",")[0]?.trim() || null;
}
