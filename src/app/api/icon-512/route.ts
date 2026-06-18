import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: "100px",
          gap: "16px",
        },
      },
      React.createElement("div", { style: { fontSize: 240, lineHeight: 1 } }, "🔗"),
      React.createElement(
        "div",
        {
          style: {
            color: "white",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "4px",
            fontFamily: "system-ui, sans-serif",
          },
        },
        "RC"
      )
    ),
    { width: 512, height: 512 }
  );
}
