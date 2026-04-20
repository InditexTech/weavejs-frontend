// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { TemplateEntity } from "../components/templates/types";

type Step = "select-room" | "select-page" | "select-template" | "confirm";

type Room = {
  id: string;
  name: string;
  create: boolean;
};

type Page = {
  id: string;
  name: string;
};

interface AddToRoomState {
  step: Step;
  room: Room | undefined;
  page: Page | undefined;
  template: TemplateEntity | undefined;
  frameName: string;
  setStep: (step: Step) => void;
  setRoom: (room: Room | undefined) => void;
  setPage: (room: Page | undefined) => void;
  setTemplate: (template: TemplateEntity | undefined) => void;
  setFrameName: (frameName: string) => void;
}

export const useAddToRoom = create<AddToRoomState>()((set) => ({
  step: "select-room",
  room: undefined,
  page: undefined,
  template: undefined,
  frameName: "",
  setStep: (step) => set((state) => ({ ...state, step })),
  setRoom: (room) => set((state) => ({ ...state, room })),
  setPage: (page) => set((state) => ({ ...state, page })),
  setTemplate: (template) => set((state) => ({ ...state, template })),
  setFrameName: (frameName) => set((state) => ({ ...state, frameName })),
}));
