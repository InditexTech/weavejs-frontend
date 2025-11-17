// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

interface TemplatesState {
  saveDialog: {
    visible: boolean;
  };
  setSaveDialogVisible: (newVisible: boolean) => void;
}

export const useTemplates = create<TemplatesState>()((set) => ({
  saveDialog: {
    visible: false,
  },
  setSaveDialogVisible: (newVisible) =>
    set((state) => ({
      ...state,
      saveDialog: {
        visible: newVisible,
      },
    })),
}));
