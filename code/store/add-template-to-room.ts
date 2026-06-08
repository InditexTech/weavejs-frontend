// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { TemplateEntity } from "@/components/room-components/templates-library/types";
import { create } from "zustand";
import {
  templateParametersSchema,
  type TemplateParameters,
} from "@/components/room-components/hooks/template-parameters.schema";

type Step = "select-template" | "configuration" | "confirm";

type Room = {
  id: string;
  name: string;
  create: boolean;
};

type Page = {
  id: string;
  name: string;
};

export type ImageInfo = {
  id: string;
  url: string;
  size: {
    width: number;
    height: number;
  };
};

interface AddTemplateToRoomState {
  visible: boolean;
  step: Step;
  room: Room | undefined;
  page: Page | undefined;
  template: TemplateEntity | undefined;
  render: {
    size: {
      width: number;
      height: number;
    };
    scale: number;
  };
  parameters: TemplateParameters;
  initialized: boolean;
  images: ImageInfo[];
  selectedNode: string | null;
  setVisible: (visible: boolean) => void;
  setStep: (step: Step) => void;
  setRoom: (room: Room | undefined) => void;
  setPage: (room: Page | undefined) => void;
  setTemplate: (template: TemplateEntity | undefined) => void;
  setTemplateParameters: (params: TemplateParameters) => void;
  setImages: (images: ImageInfo[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setTemplateRender: (
    size: { width: number; height: number },
    scale: number,
  ) => void;
}

export const useAddTemplateToRoom = create<AddTemplateToRoomState>()((set) => ({
  visible: false,
  step: "select-template",
  room: undefined,
  page: undefined,
  template: undefined,
  render: {
    size: {
      width: 0,
      height: 0,
    },
    scale: 1,
  },
  parameters: {},
  initialized: false,
  images: [],
  selectedNode: null,
  setVisible: (visible) => set((state) => ({ ...state, visible })),
  setStep: (step) => set((state) => ({ ...state, step })),
  setRoom: (room) => set((state) => ({ ...state, room })),
  setPage: (page) => set((state) => ({ ...state, page })),
  setTemplate: (template) => set((state) => ({ ...state, template })),
  setTemplateParameters: (parameters) => {
    const result = templateParametersSchema.safeParse(parameters);
    if (!result.success) {
      console.error("Invalid template parameters:", result.error);
      return;
    }
    set((state) => ({ ...state, parameters: result.data }));
  },
  setImages: (images) => set((state) => ({ ...state, images })),
  setSelectedNode: (selectedNode) =>
    set((state) => ({ ...state, selectedNode })),
  setInitialized: (initialized) => set((state) => ({ ...state, initialized })),
  setTemplateRender: (size, scale) =>
    set((state) => ({
      ...state,
      render: {
        size,
        scale,
      },
    })),
}));
