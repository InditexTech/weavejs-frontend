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
  images: {
    showSelectFile: boolean;
    uploading: boolean;
    selected: string[];
  };
  addToRoom: {
    open: boolean;
  };
  setUser: (newUser: StandaloneUser | undefined) => void;
  setInstanceId: (newInstanceId: string) => void;
  setTemplatesManage: (manage: boolean) => void;
  setShowSelectFileImage: (newShowSelectFileImage: boolean) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setSelectedImages: (newSelectedImages: string[]) => void;
  setAddToRoomOpen: (open: boolean) => void;
}

export const useTemplatesUseCase = create<TemplatesUseCaseState>()((set) => ({
  user: undefined,
  instanceId: "undefined",
  templates: {
    manage: false,
  },
  images: {
    showSelectFile: false,
    uploading: false,
    selected: [],
  },
  addToRoom: {
    open: false,
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
  setUploadingImage: (newUploadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, uploading: newUploadingImage },
    })),
  setShowSelectFileImage: (newShowSelectFileImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, showSelectFile: newShowSelectFileImage },
    })),
  setSelectedImages: (newSelectedImages) =>
    set((state) => ({
      ...state,
      images: { ...state.images, selected: newSelectedImages },
    })),
  setAddToRoomOpen: (open) =>
    set((state) => ({
      ...state,
      addToRoom: { ...state.addToRoom, open },
    })),
}));
