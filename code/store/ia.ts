// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import Konva from "konva";

export type LLMGeneratorType =
  | "create"
  | "edit-prompt"
  | "edit-variation"
  | "edit-mask";

type LLMSetupState = "idle" | "validating";
type LLMServerState = "idle" | "generating" | "uploading";

export type ImageReference = {
  base64Image: string;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    predictions: any;
  };
  references: {
    imagesIds: string[];
    images: ImageReference[];
    visible: boolean;
  };
  mask: {
    selecting: boolean;
    selected: string[];
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
  setImagesLLMReferencesVisible: (newReferencesVisible: boolean) => void;
  setImagesLLMReferencesIds: (newReferencesIds: string[]) => void;
  setImagesLLMReferences: (newReferences: ImageReference[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImagesLLMPredictions: (newPredictions: any) => void;
  setSelectingMasks: (newSelectingMask: boolean) => void;
  setSelectedMasks: (
    newMask: string[] | ((prev: string[]) => string[])
  ) => void;
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
    predictions: null,
  },
  references: {
    imagesIds: [],
    images: [],
    visible: false,
  },
  mask: {
    selected: [],
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
  setImagesLLMReferencesVisible: (newReferencesVisible) =>
    set((state) => ({
      ...state,
      references: { ...state.references, visible: newReferencesVisible },
    })),
  setImagesLLMReferencesIds: (newReferencesIds) =>
    set((state) => ({
      ...state,
      references: { ...state.references, imagesIds: newReferencesIds },
    })),
  setImagesLLMReferences: (newReferences) =>
    set((state) => ({
      ...state,
      references: { ...state.references, images: newReferences },
    })),
  setImagesLLMPredictions: (newPredictions) =>
    set((state) => ({
      ...state,
      llmPopup: { ...state.llmPopup, predictions: newPredictions },
    })),
  setSelectingMasks: (newSelecting) =>
    set((state) => ({
      ...state,
      mask: { ...state.mask, selecting: newSelecting },
    })),
  setSelectedMasks: (newSelected) =>
    set((state) => {
      if (Array.isArray(newSelected)) {
        return {
          ...state,
          mask: { ...state.mask, selected: newSelected },
        };
      }
      return {
        ...state,
        mask: { ...state.mask, selected: newSelected(state.mask.selected) },
      };
    }),
}));
