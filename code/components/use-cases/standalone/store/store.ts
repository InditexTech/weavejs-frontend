// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { ThreadStatus } from "../components/comment/types";

type StandaloneUser = {
  id: string;
  name: string;
  email: string;
};

interface StandaloneUseCaseState {
  user: StandaloneUser | undefined;
  instanceId: string;
  managing: {
    imageId: string | null;
    width: number;
    height: number;
  };
  actions: {
    saving: boolean;
  };
  images: {
    showSelectFile: boolean;
    uploading: boolean;
    loading: boolean;
  };
  comments: {
    show: boolean;
    status: ThreadStatus | "all";
  };
  setUser: (newUser: StandaloneUser) => void;
  setInstanceId: (newInstanceId: string) => void;
  setManagingImageId: (newImageId: string | null) => void;
  setManagingImageSize: (newWidth: number, newHeight: number) => void;
  setShowSelectFileImage: (newShowSelectFileImage: boolean) => void;
  setLoadingImage: (newLoadingImage: boolean) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setSaving: (newSaving: boolean) => void;
  setCommentsShow: (newShow: boolean) => void;
  setCommentsStatus: (newStatus: ThreadStatus | "all") => void;
}

export const useStandaloneUseCase = create<StandaloneUseCaseState>()((set) => ({
  user: undefined,
  instanceId: "undefined",
  managing: {
    imageId: null,
    width: 0,
    height: 0,
  },
  actions: {
    saving: false,
  },
  images: {
    showSelectFile: false,
    uploading: false,
    loading: false,
  },
  comments: {
    show: false,
    status: "pending",
  },
  setUser: (newUser) => set((state) => ({ ...state, user: newUser })),
  setInstanceId: (newInstanceId) =>
    set((state) => ({ ...state, instanceId: newInstanceId })),
  setManagingImageId: (newImageId) =>
    set((state) => ({
      ...state,
      managing: { ...state.managing, imageId: newImageId },
    })),
  setManagingImageSize: (newWidth, newHeight) =>
    set((state) => ({
      ...state,
      managing: { ...state.managing, width: newWidth, height: newHeight },
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
  setLoadingImage: (newLoadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, loading: newLoadingImage },
    })),
  setSaving: (newSaving) =>
    set((state) => ({
      ...state,
      actions: { ...state.actions, saving: newSaving },
    })),
  setCommentsShow: (newShow) =>
    set((state) => ({
      ...state,
      comments: { ...state.comments, show: newShow },
    })),
  setCommentsStatus: (newStatus) =>
    set((state) => ({
      ...state,
      comments: { ...state.comments, status: newStatus },
    })),
}));
