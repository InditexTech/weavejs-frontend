// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import Konva from "konva";

type LLMGeneratorType = "create" | "edit-prompt" | "edit-mask";

type LLMSetupState = "idle" | "validating";
type LLMServerState = "idle" | "generating" | "uploading";

export type ImageReference = {
  base64Image: string;
  description: string;
};

interface IACapabilitiesState {
  enabled: boolean;
  setup: {
    visible: boolean;
    state: LLMSetupState;
  };
  llmPopup: {
    type: LLMGeneratorType;
    visible: boolean;
    selected: Konva.Node[] | null;
    imageBase64: string | null;
    state: LLMServerState;
    error: Error | null;
    references: ImageReference[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictions: any;
  };
  mask: {
    selecting: boolean;
    selected: string[] | null;
  };
  setEnabled: (newEnabled: boolean) => void;
  setSetupVisible: (newSetupVisible: boolean) => void;
  setSetupState: (newState: LLMSetupState) => void;
  setImagesLLMPopupSelectedNodes: (
    newSelectedNodes: Konva.Node[] | null
  ) => void;
  setImagesLLMPopupType: (newImagesLLMPopupType: LLMGeneratorType) => void;
  setImagesLLMPopupVisible: (newImagesLLMPopupVisible: boolean) => void;
  setImagesLLMPopupImage: (newImagesLLMPopupImage: string | null) => void;
  setImagesLLMPopupState: (newState: LLMServerState) => void;
  setImagesLLMPopupError: (newError: Error | null) => void;
  setImagesLLMReferences: (newReferences: ImageReference[] | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImagesLLMPredictions: (newPredictions: any) => void;
  setSelectingMask: (newSelectingMask: boolean) => void;
  setSelectedMask: (newMask: string[] | null) => void;
}

export const useIACapabilities = create<IACapabilitiesState>()((set) => ({
  enabled: sessionStorage.getItem("weave_ai_enabled") === "true",
  setup: {
    state: "idle",
    visible: false,
  },
  llmPopup: {
    type: "create",
    visible: false,
    selected: null,
    imageBase64: null,
    state: "idle",
    error: null,
    references: null,
    predictions: null,
  },
  mask: {
    selected: null,
    selecting: false,
  },
  setEnabled: (newEnabled) =>
    set((state) => ({
      ...state,
      enabled: newEnabled,
    })),
  setSetupVisible: (newVisible) =>
    set((state) => ({
      ...state,
      setup: { ...state.setup, visible: newVisible },
    })),
  setSetupState: (newState) =>
    set((state) => ({
      ...state,
      setup: { ...state.setup, state: newState },
    })),
  setImagesLLMPopupSelectedNodes: (newSelectedNodes: Konva.Node[] | null) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, selected: newSelectedNodes },
    })),
  setImagesLLMPopupType: (newType) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, type: newType },
    })),
  setImagesLLMPopupVisible: (newVisible) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, visible: newVisible },
    })),
  setImagesLLMPopupImage: (newImage) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, imageBase64: newImage },
    })),
  setImagesLLMPopupState: (newState) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, state: newState },
    })),
  setImagesLLMPopupError: (newError) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, error: newError },
    })),
  setImagesLLMReferences: (newReferences) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, references: newReferences },
    })),
  setImagesLLMPredictions: (newPredictions) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, predictions: newPredictions },
    })),
  setSelectingMask: (newSelecting) =>
    set((state) => ({
      ...state,
      mask: { ...state.mask, selecting: newSelecting },
    })),
  setSelectedMask: (newSelected) =>
    set((state) => ({
      ...state,
      mask: { ...state.mask, selected: newSelected },
    })),
}));
