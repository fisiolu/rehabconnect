import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon della scheda del browser. Deliberatamente diverso dal logo del
 * sito (casa + mani + cuore, in teal/corallo): un pin di localizzazione,
 * lo stesso linguaggio visivo già usato in tutta l'app (mappa, "tu sei
 * qui", bottone "Cerca vicino a me"), sul blu-teal proprio dell'app. Le due
 * schede del browser restano distinguibili a colpo d'occhio.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c5670",
          borderRadius: 7,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
            fill="white"
          />
          <circle cx="12" cy="10" r="3" fill="#1c5670" />
        </svg>
      </div>
    ),
    size
  );
}
