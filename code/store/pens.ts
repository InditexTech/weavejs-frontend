// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { PEN_DEFAULTS } from "@/lib/pens-eraser/pen-defaults";

export type PenPanel = "tools" | "ink" | "size";

export type PenTuned = { size?: number; opacity?: number };

type PensState = {
  panel: PenPanel;
  collapsed: boolean;
  /** The pen the user chose last; `null` until one is chosen. */
  pen: string | null;
  /** The colour shared by the pens, as `#rrggbb`. */
  ink: string;
  /** Colours of the pens that keep their own. */
  inks: Record<string, string>;
  /** Size and opacity the user set for each pen. */
  tuned: Record<string, PenTuned>;
  setPanel: (panel: PenPanel) => void;
  setCollapsed: (collapsed: boolean) => void;
  setPen: (pen: string) => void;
  setInk: (color: string) => void;
  setTuned: (pen: string, patch: PenTuned) => void;
};

export const PENS_INITIAL = {
  panel: "tools" as PenPanel,
  collapsed: false,
  pen: null as string | null,
  ink: "#000000",
  inks: {} as Record<string, string>,
  tuned: {} as Record<string, PenTuned>,
};

export const usePens = create<PensState>()((set, get) => ({
  ...PENS_INITIAL,
  setPanel: (panel) => set({ panel }),
  setCollapsed: (collapsed) => set({ collapsed }),
  setPen: (pen) => set({ pen }),
  setInk: (color) => {
    const { pen, inks } = get();
    if (pen && PEN_DEFAULTS[pen]?.color) {
      set({ inks: { ...inks, [pen]: color } });
    } else {
      set({ ink: color });
    }
  },
  setTuned: (pen, patch) =>
    set((state) => ({
      tuned: { ...state.tuned, [pen]: { ...state.tuned[pen], ...patch } },
    })),
}));

/** The colour a pen draws with. */
export function inkFor(
  state: Pick<PensState, "ink" | "inks">,
  pen: string,
): string {
  return state.inks[pen] ?? PEN_DEFAULTS[pen]?.color ?? state.ink;
}
