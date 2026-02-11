// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { ThreadStatus } from "../components/comment/types";
import { WeaveElementAttributes } from "@inditextech/weave-types";

type NodePropertiesAction = "create" | "update" | undefined;

type StandaloneUser = {
  id: string;
  name: string;
  email: string;
};

interface StandaloneUseCaseState {
  user: StandaloneUser | undefined;
  instanceId: string;
  configuration: {
    open: boolean;
  };
  measurement: {
    open: boolean;
    unit: string | null;
    measureId: string | null;
  };
  managing: {
    imageId: string | null;
    width: number;
    height: number;
  };
  actions: {
    saving: boolean;
    exporting: boolean;
  };
  images: {
    showSelectFile: boolean;
    uploading: boolean;
    loading: boolean;
  };
  sidebar: {
    active: "comments" | "measures" | null;
  };
  comments: {
    show: boolean;
    status: ThreadStatus | "all";
  };
  nodeProperties: {
    action: NodePropertiesAction;
    createProps: WeaveElementAttributes | undefined;
  };
  setUser: (newUser: StandaloneUser | undefined) => void;
  setInstanceId: (newInstanceId: string) => void;
  setManagingImageId: (newImageId: string | null) => void;
  setManagingImageSize: (newWidth: number, newHeight: number) => void;
  setShowSelectFileImage: (newShowSelectFileImage: boolean) => void;
  setLoadingImage: (newLoadingImage: boolean) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setExporting: (newSaving: boolean) => void;
  setSaving: (newSaving: boolean) => void;
  setSidebarActive: (newActive: "comments" | "measures" | null) => void;
  setCommentsShow: (newShow: boolean) => void;
  setCommentsStatus: (newStatus: ThreadStatus | "all") => void;
  setConfigurationOpen: (newOpen: boolean) => void;
  setNodePropertiesAction: (
    newNodePropertiesAction: NodePropertiesAction
  ) => void;
  setNodePropertiesCreateProps: (
    newNodePropertiesCreateProps: WeaveElementAttributes | undefined
  ) => void;
  setMeasureUnit: (newUnit: string) => void;
  setMeasureId: (newMeasureId: string | null) => void;
  setMeasurementDefinitionOpen: (newOpen: boolean) => void;
}

export const useStandaloneUseCase = create<StandaloneUseCaseState>()((set) => ({
  user: undefined,
  instanceId: "undefined",
  configuration: {
    open: false,
  },
  measurement: {
    open: false,
    unit: null,
    measureId: null,
    forceDefine: false,
  },
  managing: {
    imageId: null,
    width: 0,
    height: 0,
  },
  actions: {
    exporting: false,
    saving: false,
  },
  images: {
    showSelectFile: false,
    uploading: false,
    loading: false,
  },
  sidebar: {
    active: "measures",
  },
  comments: {
    show: false,
    status: "pending",
  },
  nodeProperties: {
    action: undefined,
    createProps: undefined,
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
  setExporting: (newExporting) =>
    set((state) => ({
      ...state,
      actions: { ...state.actions, exporting: newExporting },
    })),
  setSaving: (newSaving) =>
    set((state) => ({
      ...state,
      actions: { ...state.actions, saving: newSaving },
    })),
  setSidebarActive: (newActive) =>
    set((state) => ({
      ...state,
      sidebar: { active: newActive },
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
  setConfigurationOpen: (newOpen: boolean) =>
    set((state) => ({
      ...state,
      configuration: {
        ...state.configuration,
        open: newOpen,
      },
    })),
  setNodePropertiesAction: (newNodePropertiesAction) =>
    set((state) => ({
      ...state,
      nodeProperties: {
        ...state.nodeProperties,
        action: newNodePropertiesAction,
      },
    })),
  setNodePropertiesCreateProps: (newNodePropertiesCreateProps) =>
    set((state) => ({
      ...state,
      nodeProperties: {
        ...state.nodeProperties,
        createProps: newNodePropertiesCreateProps,
      },
    })),
  setMeasureUnit: (newUnit) =>
    set((state) => ({
      ...state,
      measurement: {
        ...state.measurement,
        unit: newUnit,
      },
    })),
  setMeasureId: (newMeasureId) =>
    set((state) => ({
      ...state,
      measurement: {
        ...state.measurement,
        measureId: newMeasureId,
      },
    })),
  setMeasurementDefinitionOpen: (newOpen) =>
    set((state) => ({
      ...state,
      measurement: {
        ...state.measurement,
        open: newOpen,
      },
    })),
}));
