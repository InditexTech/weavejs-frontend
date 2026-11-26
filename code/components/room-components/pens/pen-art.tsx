// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";

type PenArtProps = {
  id: string;
  /** The colour the pen draws with, as a CSS colour. */
  ink: string;
  className?: string;
};

const EDGE = "rgba(0,0,0,0.3)";
const DARK = "#3a3a3d";
const BARREL = "#f7f6f3";
const FADE = { transition: "fill 240ms ease" } as const;

/**
 * The pens, standing upright with the tip on top, to be seated in a tray with
 * their lower part cut off. Barrels are neutral so the colour they draw with
 * is what stands out: the tip and a band below the cap carry it.
 */
function PenArtBase({ id, ink, className }: Readonly<PenArtProps>) {
  const uid = React.useId().replace(/:/g, "");
  const sheen = `${uid}-sheen`;
  const metal = `${uid}-metal`;

  const inkShape = { fill: ink, stroke: EDGE, strokeWidth: 0.4, style: FADE };
  const barrel = (top: number) => (
    <>
      <rect
        x="6"
        y={top}
        width="12"
        height={72 - top}
        fill={BARREL}
        stroke="#dcdad4"
        strokeWidth="0.4"
      />
      <rect
        x="6"
        y={top}
        width="12"
        height={72 - top}
        fill={`url(#${sheen})`}
      />
    </>
  );
  const band = (top: number) => (
    <rect x="6" y={top} width="12" height="3" {...inkShape} />
  );

  const art = (() => {
    switch (id) {
      case "pencil":
        return (
          <>
            {barrel(34)}
            {band(30)}
            <rect x="6" y="26" width="12" height="4" fill={DARK} />
            <path
              d="M6 26 L12 8 L18 26 Z"
              fill="#ecd2a6"
              stroke="#cdb184"
              strokeWidth="0.3"
            />
            <path d="M12 8 L18 26 L14.2 26 Z" fill="#000" opacity="0.08" />
            <path d="M10.2 14 L12 8 L13.8 14 Z" {...inkShape} />
          </>
        );
      case "pen":
        return (
          <>
            {barrel(36)}
            {band(33)}
            <path d="M6 33 L8.5 22 L15.5 22 L18 33 Z" fill={DARK} />
            <path d="M10 22 L12 3 L14 22 Z" {...inkShape} />
          </>
        );
      case "fineliner":
        return (
          <>
            {barrel(36)}
            {band(33)}
            <path d="M6 33 L9 25 L15 25 L18 33 Z" fill={DARK} />
            <rect x="9.3" y="22" width="5.4" height="3.2" fill="#2b2b2d" />
            <rect
              x="11.2"
              y="4"
              width="1.6"
              height="18.5"
              rx="0.8"
              {...inkShape}
            />
          </>
        );
      case "marker":
        return (
          <>
            {barrel(36)}
            {band(33)}
            <path d="M6 33 L8.5 24 L15.5 24 L18 33 Z" fill={DARK} />
            <rect
              x="8.8"
              y="5"
              width="6.4"
              height="19.5"
              rx="2.4"
              {...inkShape}
            />
          </>
        );
      case "highlighter":
        return (
          <>
            {barrel(36)}
            {band(33)}
            <path d="M6 33 L8 22 L16 22 L18 33 Z" fill={DARK} />
            <path d="M8 22 L8.4 11 L16 6 L16 22 Z" {...inkShape} />
          </>
        );
      case "brush":
        return (
          <>
            {barrel(38)}
            {band(35)}
            <rect
              x="7.5"
              y="24"
              width="9"
              height="11"
              fill={`url(#${metal})`}
              stroke="#9a9da3"
              strokeWidth="0.3"
            />
            <path d="M8 24 C8 15 10 9 12 3 C14 9 16 15 16 24 Z" {...inkShape} />
          </>
        );
      case "fountainPen":
        return (
          <>
            {barrel(36)}
            {band(33)}
            <path d="M6 33 L9.5 22 L14.5 22 L18 33 Z" fill={DARK} />
            <path
              d="M9.5 22 L12 4 L14.5 22 Q12 24.5 9.5 22 Z"
              fill="#d9b44a"
              stroke="#a8862b"
              strokeWidth="0.3"
            />
            <line
              x1="12"
              y1="9.5"
              x2="12"
              y2="20"
              stroke="#7a5f17"
              strokeWidth="0.5"
            />
            <circle cx="12" cy="12.5" r="1" fill="#7a5f17" />
          </>
        );
      case "eraser":
        return (
          <>
            {barrel(40)}
            <rect
              x="6"
              y="36"
              width="12"
              height="5"
              fill={`url(#${metal})`}
              stroke="#9a9da3"
              strokeWidth="0.3"
            />
            <rect
              x="6"
              y="10"
              width="12"
              height="27"
              rx="3"
              fill="#f0b8ae"
              stroke="#d99a8f"
              strokeWidth="0.4"
            />
          </>
        );
      default:
        return <rect x="9" y="8" width="6" height="56" rx="3" fill="#888" />;
    }
  })();

  return (
    <svg
      viewBox="0 0 24 72"
      aria-hidden="true"
      className={className}
      data-pen={id}
      data-ink={ink}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={sheen} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="0.14" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.03" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={metal} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8e9197" />
          <stop offset="0.3" stopColor="#f1f2f4" />
          <stop offset="0.6" stopColor="#c3c6cb" />
          <stop offset="1" stopColor="#8a8d93" />
        </linearGradient>
      </defs>
      {art}
    </svg>
  );
}

/** Memoised: every prop is a primitive, so dragging a slider does not redraw the tray. */
export const PenArt = React.memo(PenArtBase);
