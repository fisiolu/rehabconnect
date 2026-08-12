import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

const e = React.createElement;

/**
 * Immagine di anteprima mostrata quando il link viene condiviso
 * su WhatsApp, Facebook, Telegram o via messaggio.
 * Misura standard 1200x630.
 */
export function GET() {
  return new ImageResponse(
    e(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #12324A 0%, #1e4a6b 55%, #14B8A6 100%)",
          fontFamily: "system-ui, sans-serif",
        },
      },
      // Riga del marchio
      e(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" } },
        e(
          "div",
          {
            style: {
              width: "68px",
              height: "68px",
              borderRadius: "20px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
            },
          },
          "🏠"
        ),
        e(
          "div",
          { style: { color: "#ffffff", fontSize: "34px", fontWeight: 700, letterSpacing: "-0.5px" } },
          "Fisioterapista Domiciliare"
        )
      ),
      // Promessa principale
      e(
        "div",
        {
          style: {
            color: "#ffffff",
            fontSize: "76px",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-2px",
            marginBottom: "28px",
          },
        },
        "Il Fisioterapista a casa tua,"
      ),
      e(
        "div",
        {
          style: {
            color: "#7dd3fc",
            fontSize: "76px",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-2px",
            marginBottom: "40px",
          },
        },
        "vicino davvero."
      ),
      e(
        "div",
        { style: { color: "#cbd5e1", fontSize: "32px", lineHeight: 1.35 } },
        "Vedi sulla mappa chi lavora nella tua zona · In tutta Italia"
      )
    ),
    { width: 1200, height: 630 }
  );
}
