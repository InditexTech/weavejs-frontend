// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { RichTextModel, TextLayout, TextStyle } from "./types";
import { DEFAULT_TEXT_STYLE } from "./constants";
import Konva from "konva";

interface RichTextState {
  style: TextStyle | null;
  styles: TextStyle[];
  stage: Konva.Stage | null;
  guides: {
    bounds: boolean;
    baselines: boolean;
    segments: boolean;
  };
  editing: boolean;
  selected: string[];
  model: RichTextModel | undefined;
  limits: {
    width: number;
    height: number;
  };
  layout: TextLayout | null;
  setStyle: (style: TextStyle | null) => void;
  setStyles: (styles: TextStyle[]) => void;
  setStage: (stage: Konva.Stage | null) => void;
  setGuidesBounds: (newBounds: boolean) => void;
  setGuidesBaselines: (newBaselines: boolean) => void;
  setGuidesSegments: (newSegments: boolean) => void;
  setEditing: (editing: boolean) => void;
  setSelected: (selected: string[]) => void;
  setModel: (model: RichTextModel | undefined) => void;
  setLimits: (limits: { width: number; height: number }) => void;
  setLayout: (layout: TextLayout | null) => void;
}

export const useRichText = create<RichTextState>()((set) => {
  return {
    style: DEFAULT_TEXT_STYLE,
    styles: [DEFAULT_TEXT_STYLE],
    stage: null,
    guides: {
      bounds: false,
      baselines: false,
      segments: false,
    },
    editing: false,
    selected: [],
    model: undefined,
    limits: {
      width: Infinity,
      height: Infinity,
    },
    layout: null,
    setStyle: (style) =>
      set((state) => ({
        ...state,
        style,
      })),
    setStyles: (styles) =>
      set((state) => ({
        ...state,
        styles,
      })),
    setStage: (stage) =>
      set((state) => ({
        ...state,
        stage,
      })),
    setGuidesBounds: (newBounds) =>
      set((state) => ({
        ...state,
        guides: { ...state.guides, bounds: newBounds },
      })),
    setGuidesBaselines: (newBaselines) =>
      set((state) => ({
        ...state,
        guides: { ...state.guides, baselines: newBaselines },
      })),
    setGuidesSegments: (newSegments) =>
      set((state) => ({
        ...state,
        guides: { ...state.guides, segments: newSegments },
      })),
    setEditing: (editing) =>
      set((state) => ({
        ...state,
        editing,
      })),
    setSelected: (selected) =>
      set((state) => ({
        ...state,
        selected,
      })),
    setModel: (model) =>
      set((state) => ({
        ...state,
        model,
      })),
    setLimits: (limits) =>
      set((state) => ({
        ...state,
        limits,
      })),
    setLayout: (layout) =>
      set((state) => ({
        ...state,
        layout,
      })),
  };
});
