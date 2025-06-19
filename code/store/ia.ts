// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

type LLMGeneratorType = "create" | "edit";

type LLMSetupState = "idle" | "validating";
type LLMServerState = "idle" | "generating" | "uploading";

interface IACapabilitiesState {
  enabled: boolean;
  setup: {
    visible: boolean;
    state: LLMSetupState;
  };
  llmPopup: {
    type: LLMGeneratorType;
    visible: boolean;
    imageBase64: string | null;
    state: LLMServerState;
    error: Error | null;
  };
  setEnabled: (newEnabled: boolean) => void;
  setSetupVisible: (newSetupVisible: boolean) => void;
  setSetupState: (newState: LLMSetupState) => void;
  setImagesLLMPopupType: (newImagesLLMPopupType: LLMGeneratorType) => void;
  setImagesLLMPopupVisible: (newImagesLLMPopupVisible: boolean) => void;
  setImagesLLMPopupImage: (newImagesLLMPopupImage: string | null) => void;
  setImagesLLMPopupState: (newState: LLMServerState) => void;
  setImagesLLMPopupError: (newError: Error | null) => void;
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
    imageBase64: null,
    state: "idle",
    error: null,
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
}));
