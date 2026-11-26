// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/** The pens in the order they sit in the tray. */
export const PEN_ORDER = [
  "pencil",
  "pen",
  "fineliner",
  "marker",
  "highlighter",
  "brush",
  "fountainPen",
] as const;

type PenDefaults = {
  /** Brush width when the pen is first chosen. */
  size: number;
  /** A pen that only makes sense in one colour keeps its own ink. */
  color?: string;
};

export const PEN_DEFAULTS: Record<string, PenDefaults> = {
  pencil: { size: 1 },
  pen: { size: 6 },
  fineliner: { size: 2 },
  marker: { size: 18 },
  highlighter: { size: 28, color: "#fff01f" },
  brush: { size: 14 },
  fountainPen: { size: 8 },
};

export const FALLBACK_PEN_SIZE = 6;

export function penDefaultSize(id: string): number {
  return PEN_DEFAULTS[id]?.size ?? FALLBACK_PEN_SIZE;
}

export function sortPens<T extends { id: string }>(pens: T[]): T[] {
  const rank = (id: string) => {
    const i = (PEN_ORDER as readonly string[]).indexOf(id);
    return i === -1 ? PEN_ORDER.length : i;
  };
  return [...pens].sort((a, b) => rank(a.id) - rank(b.id));
}
