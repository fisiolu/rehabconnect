/**
 * Verifica lato server un token Cloudflare Turnstile. Va richiamata da ogni
 * route che riceve un form pubblico (qui: le due registrazioni): il widget
 * si può aggirare chiamando la route direttamente, questo controllo no.
 */
export async function verificaTurnstile(
  token: string | undefined,
  ip: string | null
): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY non impostata: registrazione bloccata per sicurezza.");
    return false;
  }

  const corpo = new URLSearchParams({ secret, response: token });
  if (ip) corpo.set("remoteip", ip);

  try {
    const risposta = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
    });
    const dati = (await risposta.json()) as { success: boolean };
    return dati.success === true;
  } catch {
    return false;
  }
}
