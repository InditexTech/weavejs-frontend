// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";

const Cursor = ({
  className,
  color,
  label,
}: Readonly<{ className: string; color: string; label: string }>) => (
  <g className={className}>
    <path d="M0 0 L0 14 L4 10.5 L7 17 L9.5 16 L6.5 9.5 L12 9.5 Z" fill={color} />
    <rect x="13" y="13" width={label.length * 6 + 12} height="16" fill={color} />
    <text
      x="19"
      y="24.5"
      fontSize="10"
      fontFamily="Inter, sans-serif"
      fill="#fff"
    >
      {label}
    </text>
  </g>
);

export const SessionLiveCanvas = () => (
  <svg
    viewBox="0 0 420 200"
    className="w-full h-auto border border-black/10 bg-white"
    role="img"
    aria-label="Preview of two collaborators drawing on a shared Weave.js canvas"
  >
    <defs>
      <pattern id="live-canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="#00000022" />
      </pattern>
    </defs>
    <rect width="420" height="200" fill="url(#live-canvas-grid)" />
    <g fill="none" stroke="#171717" strokeWidth="1.25" pathLength={1}>
      <rect
        x="40" y="40" width="110" height="70"
        pathLength={1}
        className="live-canvas-stroke"
        style={{ animationDelay: "150ms" }}
      />
      <circle
        cx="250" cy="90" r="38"
        pathLength={1}
        className="live-canvas-stroke"
        style={{ animationDelay: "500ms" }}
      />
      <path
        d="M150 75 H212"
        pathLength={1}
        className="live-canvas-stroke"
        style={{ animationDelay: "850ms" }}
      />
      <path
        d="M70 150 C 130 120, 200 175, 340 150"
        pathLength={1}
        stroke="#2563eb"
        className="live-canvas-stroke"
        style={{ animationDelay: "1100ms" }}
      />
    </g>
    <Cursor className="live-canvas-cursor-a" color="#2563eb" label="Alex" />
    <Cursor className="live-canvas-cursor-b" color="#171717" label="Sam" />
  </svg>
);
