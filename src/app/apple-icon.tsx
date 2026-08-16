import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Icona per la schermata Home di iOS/iPadOS: niente trasparenza né angoli
 * arrotondati, ci pensa già iOS ad applicare la maschera. Stesso pin del
 * favicon (vedi icon.tsx), solo più grande.
 */
export default function AppleIcon() {
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
        }}
      >
        <svg width="104" height="104" viewBox="0 0 24 24" fill="none">
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
