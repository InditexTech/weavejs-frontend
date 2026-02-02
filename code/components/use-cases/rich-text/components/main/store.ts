// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { RichTextModel, TextStyle } from "./types";
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
  model: RichTextModel | undefined;
  setStyle: (style: TextStyle | null) => void;
  setStyles: (styles: TextStyle[]) => void;
  setStage: (stage: Konva.Stage | null) => void;
  setGuidesBounds: (newBounds: boolean) => void;
  setGuidesBaselines: (newBaselines: boolean) => void;
  setGuidesSegments: (newSegments: boolean) => void;
  setEditing: (editing: boolean) => void;
  setModel: (model: RichTextModel | undefined) => void;
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
    model: undefined,
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
    setModel: (model) =>
      set((state) => ({
        ...state,
        model,
      })),
  };
});
