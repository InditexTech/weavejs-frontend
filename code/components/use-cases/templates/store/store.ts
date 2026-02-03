// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

type StandaloneUser = {
  id: string;
  name: string;
  email: string;
};

interface TemplatesUseCaseState {
  user: StandaloneUser | undefined;
  instanceId: string;
  templates: {
    manage: boolean;
  };
  setUser: (newUser: StandaloneUser | undefined) => void;
  setInstanceId: (newInstanceId: string) => void;
  setTemplatesManage: (manage: boolean) => void;
}

export const useTemplatesUseCase = create<TemplatesUseCaseState>()((set) => ({
  user: undefined,
  instanceId: "undefined",
  templates: {
    manage: false,
  },
  setUser: (newUser) => set((state) => ({ ...state, user: newUser })),
  setInstanceId: (newInstanceId) =>
    set((state) => ({ ...state, instanceId: newInstanceId })),
  setTemplatesManage: (manage) =>
    set((state) => ({
      ...state,
      templates: {
        ...state.templates,
        manage,
      },
    })),
}));
