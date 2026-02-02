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
    units: string;
    referenceMeasureUnits: number;
    referenceMeasurePixels: number | null;
  };
  customMeasurement: {
    open: boolean;
    measureId: string | null;
    measures: Record<string, { realMeasure?: number; pixelsSize: number }>;
    unit: string | undefined;
    unitPerPixel: number | undefined;
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
  setCommentsShow: (newShow: boolean) => void;
  setCommentsStatus: (newStatus: ThreadStatus | "all") => void;
  setConfigurationOpen: (newOpen: boolean) => void;
  setMeasurement: (units: string, referenceMeasureUnits: number) => void;
  setReferenceMeasurePixels: (referenceMeasurePixels: number | null) => void;
  setNodePropertiesAction: (
    newNodePropertiesAction: NodePropertiesAction
  ) => void;
  setNodePropertiesCreateProps: (
    newNodePropertiesCreateProps: WeaveElementAttributes | undefined
  ) => void;
  setMeasureId: (newMeasureId: string | null) => void;
  setMeasurementDefinitionOpen: (newOpen: boolean) => void;
  setMeasures: (
    measures: Record<string, { realMeasure: number; pixelsSize: number }>
  ) => void;
  setUnit: (unit: string | undefined) => void;
  setUnitPerPixel: (unitPerPixel: number | undefined) => void;
}

export const useStandaloneUseCase = create<StandaloneUseCaseState>()((set) => ({
  user: undefined,
  instanceId: "undefined",
  configuration: {
    open: false,
  },
  measurement: {
    units: "cms",
    referenceMeasureUnits: 10,
    referenceMeasurePixels: null,
  },
  customMeasurement: {
    open: false,
    measureId: null,
    measures: {},
    unit: undefined,
    unitPerPixel: undefined,
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
  setMeasurement: (units: string, referenceMeasureUnits: number) =>
    set((state) => ({
      ...state,
      measurement: {
        ...state.measurement,
        units,
        referenceMeasureUnits,
      },
    })),
  setReferenceMeasurePixels: (referenceMeasurePixels: number | null) =>
    set((state) => ({
      ...state,
      measurement: {
        ...state.measurement,
        referenceMeasurePixels,
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
  setMeasureId: (newMeasureId) =>
    set((state) => ({
      ...state,
      customMeasurement: {
        ...state.customMeasurement,
        measureId: newMeasureId,
      },
    })),
  setMeasurementDefinitionOpen: (newOpen) =>
    set((state) => ({
      ...state,
      customMeasurement: {
        ...state.customMeasurement,
        open: newOpen,
      },
    })),
  setMeasures: (measures) =>
    set((state) => ({
      ...state,
      customMeasurement: {
        ...state.customMeasurement,
        measures,
      },
    })),
  setUnit: (unit) =>
    set((state) => ({
      ...state,
      customMeasurement: {
        ...state.customMeasurement,
        unit,
      },
    })),
  setUnitPerPixel: (unitPerPixel) =>
    set((state) => ({
      ...state,
      customMeasurement: {
        ...state.customMeasurement,
        unitPerPixel,
      },
    })),
}));
