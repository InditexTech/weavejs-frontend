// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { TemplateEntity } from "@/components/room-components/templates-library/types";
import { create } from "zustand";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>;
  initialized: boolean;
  images: ImageInfo[];
  selectedNode: string | null;
  setVisible: (visible: boolean) => void;
  setStep: (step: Step) => void;
  setRoom: (room: Room | undefined) => void;
  setPage: (room: Page | undefined) => void;
  setTemplate: (template: TemplateEntity | undefined) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTemplateParameters: (params: Record<string, any>) => void;
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
  setTemplateParameters: (parameters) =>
    set((state) => ({ ...state, parameters })),
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
