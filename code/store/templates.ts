// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

interface TemplatesState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | undefined;
  saveDialog: {
    visible: boolean;
    kind: "template" | "imageTemplate" | undefined;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: (data: any | undefined) => void;
  setSaveDialogVisible: (newVisible: boolean) => void;
  setSaveDialogKind: (kind: "template" | "imageTemplate" | undefined) => void;
}

export const useTemplates = create<TemplatesState>()((set) => ({
  data: undefined,
  saveDialog: {
    visible: false,
    kind: undefined,
  },
  setData: (data) =>
    set((state) => ({
      ...state,
      data: data,
    })),
  setSaveDialogVisible: (newVisible) =>
    set((state) => ({
      ...state,
      saveDialog: {
        ...state.saveDialog,
        visible: newVisible,
      },
    })),
  setSaveDialogKind: (kind) =>
    set((state) => ({
      ...state,
      saveDialog: {
        ...state.saveDialog,
        kind,
      },
    })),
}));
